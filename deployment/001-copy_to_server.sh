# Globals so the EXIT trap can still see them after the function returns
DEPLOY_WORK_DIR=""
DEPLOY_AGENT_STARTED=false

source export-env.sh

error_exit() {
    echo -e "\033[31m❌ Error: $1\033[0m" >&2 
    exit "${2:-1}"
}

_cleanup_deploy() {
    [[ -n "${DEPLOY_WORK_DIR}" ]] && rm -rf -- "${DEPLOY_WORK_DIR}"
    if [[ "${DEPLOY_AGENT_STARTED}" == true ]]; then
        ssh-agent -k >/dev/null 2>&1
    fi
    return 0
}

# Archive admin/, client/, server/ and deployment/, then upload the archive and
# export-env.sh to /tmp on the server. Exports ARTIFACT / DEPLOY_FROM_LOCAL for
# the remote-side prepare_application step.
compress_and_send_to_server() {
    echo "🚀 Starting secure deployment process..."

    local script_dir project_root
    script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd) || error_exit "Cannot resolve script directory"
    
    project_root=${APPLICATION_TO_DEPLOY_DIR:-$(dirname "${script_dir}")}
    SSH_KEY_PATH=${SSH_KEY_PATH:-${project_root}/asset-key}

    : "${APP_NAME:?APP_NAME is not set}"
    : "${APP_USER:?APP_USER is not set}"
    : "${REMOTE_IP:?REMOTE_IP is not set}"
    [[ "${APP_NAME}" =~ ^[A-Za-z0-9._-]+$ ]] || error_exit "APP_NAME has unsafe characters: ${APP_NAME}"
    [[ -r "${SSH_KEY_PATH}" ]] || error_exit "SSH key not readable: ${SSH_KEY_PATH}" 



    local -a include_dirs=()
    if [[ "${DEPLOY_FROM_LOCAL}" == "true" ]]; then
        include_dirs+=(admin client server deployment)
    fi

    if [[ "${DEPLOY_FROM_GITHUB}" == "true" ]]; then
        include_dirs+=(deployment)
    fi

    ((${#include_dirs[@]} > 0)) || error_exit "No archive paths selected; set DEPLOY_FROM_LOCAL=true or DEPLOY_FROM_GITHUB=true"
    printf 'Archive paths: %s\n' "${include_dirs[*]}"

    local d
    for d in "${include_dirs[@]}"; do
        [[ -d "${project_root}/${d}" ]] || error_exit "Missing folder: ${project_root}/${d}"
    done

    local env_script="${project_root}/deployment/export-env.sh"
    [[ -f "${env_script}" ]] || error_exit "Missing file: ${env_script}"

    # Local build dir (outside the archived folders, so it never includes itself)
    DEPLOY_WORK_DIR="${project_root}/artifact"
    mkdir -p "${DEPLOY_WORK_DIR}" || error_exit "Failed to create ${DEPLOY_WORK_DIR}"
    local archive="${DEPLOY_WORK_DIR}/${APP_NAME}.tar.gz"
    rm -f -- "${archive}"
    # Note: this replaces any existing EXIT trap in the calling script
    trap _cleanup_deploy EXIT

    # Start an SSH agent only if none is usable
    if ! ssh-add -l >/dev/null 2>&1; then
        echo "🔑 Starting SSH agent..."
        eval "$(ssh-agent -s)" >/dev/null || error_exit "Failed to start SSH agent"
        DEPLOY_AGENT_STARTED=true
        ssh-add "${SSH_KEY_PATH}" || error_exit "Failed to add SSH key to agent"
    fi

    local -a ssh_opts=(
        -i "${SSH_KEY_PATH}"
        -o IdentitiesOnly=yes
        -o BatchMode=yes
        -o ConnectTimeout=10
        -o StrictHostKeyChecking=accept-new
    )
    local target="${APP_USER}@${REMOTE_IP}"

    # Build archive
    echo "📦 Creating application archive (${include_dirs[*]})..."
    local -a excludes=(
        # Match at any depth
        --exclude=node_modules
        --exclude=.git
        --exclude=.cache
        --exclude=.npm
        --exclude=.DS_Store
        --exclude=Thumbs.db
        --exclude='*.log'
        --exclude='*.tar.gz'
        --exclude='*.key'
        --exclude='*.pem'
        --exclude='*.p12'
        --exclude=.cert
        # Exact paths only (rebuilt on the server)
        --anchored
        --exclude=admin/dist
        --exclude=client/dist
        --exclude=server/dist
        --exclude=server/logs
        --exclude=server/coverage
        # Uncomment if export-env.sh should NOT also live inside the archive:
        # --exclude=deployment/export-env.sh
    )
    local rc=0

    tar "${excludes[@]}" -czf "${archive}" -C "${project_root}" "${include_dirs[@]}" || rc=$?
    if (( rc == 1 )); then
        echo "⚠️ Some files changed while archiving (tar exit 1); continuing"
    elif (( rc > 1 )); then
        error_exit "Archive creation failed (tar exit ${rc}) - check permissions and disk space"
    fi

    tar -tzf "${archive}" >/dev/null 2>&1 || error_exit "Archive is corrupt"

    # Safety net: refuse to upload if secrets or heavy folders slipped in
    if tar -tzf "${archive}" | grep -qE '(^|/)(node_modules|\.git)(/|$)|asset-key|\.pem$'; then
        error_exit "Archive contains node_modules, .git or key material - aborting"
    fi
    echo "✅ Archive created ($(du -h "${archive}" | cut -f1))"

    echo "Testing SSH connectivity..."
    ssh "${ssh_opts[@]}" "${target}" "echo 'SSH connection OK'" || error_exit "SSH connection failed"



    # Fixed remote paths (names are known, so later steps can find them without mktemp)
    local remote_file="/tmp/${APP_NAME}.tar.gz"
    local remote_env="/tmp/export-env.sh"

    # Remove stale copies; fails if another user owns them (sticky /tmp)
    ssh "${ssh_opts[@]}" "${target}" "rm -f -- '${remote_file}' '${remote_env}'" \
        || error_exit "Cannot remove existing files in /tmp (owned by another user?)"

    # Destination is a directory, so scp accepts multiple sources and keeps their names
    echo "Uploading archive and env script via SCP..."
    scp "${ssh_opts[@]}" "${archive}" "${env_script}" "${target}:/tmp/" \
        || error_exit "Upload failed"

    # Lock down both files and confirm we own them
    ssh "${ssh_opts[@]}" "${target}" \
        "chmod 600 '${remote_file}' '${remote_env}' \
         && [ \"\$(stat -c %U '${remote_file}')\" = \"\$(id -un)\" ] \
         && [ \"\$(stat -c %U '${remote_env}')\" = \"\$(id -un)\" ]" \
        || error_exit "Remote files have unexpected ownership/permissions"

    # Verify integrity of both files (parallel arrays, safe for any path characters)
    local -a local_files=("${archive}" "${env_script}")
    local -a remote_files=("${remote_file}" "${remote_env}")
    local i local_sum remote_sum
    for i in "${!local_files[@]}"; do
        local_sum=$(sha256sum "${local_files[i]}" | cut -d' ' -f1)
        remote_sum=$(ssh "${ssh_opts[@]}" "${target}" "sha256sum '${remote_files[i]}'" | cut -d' ' -f1) \
            || error_exit "Failed to checksum ${remote_files[i]}"
        [[ -n "${remote_sum}" && "${local_sum}" == "${remote_sum}" ]] \
            || error_exit "Checksum mismatch: ${remote_files[i]}"
    done

    if [[ "${DEPLOY_FROM_GITHUB}" == "true" ]]; then
        local github_agent_socket="/tmp/github-deploy-agent.sock"
        ssh -tt "${ssh_opts[@]}" "${target}" \
            "if ! SSH_AUTH_SOCK='${github_agent_socket}' ssh-add -l >/dev/null 2>&1; then rm -f '${github_agent_socket}'; eval \$(ssh-agent -a '${github_agent_socket}' -s); fi; SSH_AUTH_SOCK='${github_agent_socket}' ssh-add '${GITHUB_SSH_KEY}'; SSH_AUTH_SOCK='${github_agent_socket}' ssh-add -l" \
            || error_exit "Could not unlock GitHub SSH key on the server"
    fi
    
     # go into the server untar the file into the server
     ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no \
        "${APP_USER}@${REMOTE_IP}" "sudo bash" << EOFREMOTE
        set -euo pipefail
        chmod +x /tmp/export-env.sh
        source /tmp/export-env.sh
        if [[ -d "${ARTIFACT_LOCATION}" ]]; then
         rm -rf "${ARTIFACT_LOCATION}"
        fi
        mkdir -p "${ARTIFACT_LOCATION}" || {echo failed to create repo}
        tar -xzf "/tmp/${APP_NAME}.tar.gz" -C "${ARTIFACT_LOCATION}"
        ls -al "${ARTIFACT_LOCATION}"
        cd "${ARTIFACT_LOCATION}/deployment"

        sudo  rm -rf "/tmp/${APP_NAME}.tar.gz"


         if [[ "${DEPLOY_FROM_LOCAL}" = "true" ]]; then
             mkdir -p "${REMOTE_PATH}"/{backend,frontend,admin}|| {echo "failed to create backend frontedn admin files"}

            mv "${ARTIFACT_LOCATION}/server" "${REMOTE_PATH}/backend"
            mv "${ARTIFACT_LOCATION}/client" "${REMOTE_PATH}/frontend"
            mv "${ARTIFACT_LOCATION}/admin" "${REMOTE_PATH}/admin"
            
        fi
       
            
        if [[ "${DEPLOY_FROM_GITHUB}" = "true" ]]; then
            echo "Ready to clone the bproject from gitHub"
              bash ./002-prepare_artifact-github.sh

        fi

        
    
       export ARTIFACT="${remote_file}"
       export ENV_SCRIPT="${remote_env}"
       export DEPLOY_FROM_LOCAL=true

bash ./002-install_node.sh
bash ./004-install_pm2.sh
bash ./003-prepare_app.sh
bash ./004-service_file.sh

bash ./005-install_caddy.sh
bash ./006-clean.sh

EOFREMOTE
    [[ $? -eq 0 ]] || error_exit "Remote deployment failed"


    export ARTIFACT="${remote_file}"
    export ENV_SCRIPT="${remote_env}"
    export DEPLOY_FROM_LOCAL=true
    echo "✅ Uploaded and verified: ${remote_file} and ${remote_env}"
}

compress_and_send_to_server
