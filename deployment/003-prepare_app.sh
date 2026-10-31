# Run privileged commands directly when root, via sudo otherwise
error_exit() {
    echo "ERROR: $*" >&2
    exit 1
}

as_root() {
    if [[ ${EUID} -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

# Run commands as the app user in a login shell.
run_in() {
    local dir=$1; shift
    local cmd
    printf -v cmd '%q ' "$@"
    as_root runuser -l "${APP_RUNNER_USER}" -s /bin/bash -c "cd $(printf '%q' "${dir}") && ${cmd}"
}

copy_env(){
    local env_file_path=${1:-}
    local destination=${2:-}
    [[ -f "${env_file_path}" ]] || error_exit "Environment file not found: ${env_file_path}"
    install -m 600 -o "${APP_RUNNER_USER}" -g "${APP_GROUP:-${APP_RUNNER_USER}}" \
        "${env_file_path}" "${destination}" || error_exit "Failed to install ${env_file_path}"
}

prepare_component_permissions() {
    local path=$1
    local owner="${APP_RUNNER_USER}:${APP_GROUP:-${APP_RUNNER_USER}}"
    as_root chown -R "${owner}" "${path}" || error_exit "Failed to assign ${owner} ownership to ${path}"
    as_root chmod -R u=rwX,go=rX "${path}" || error_exit "Failed to make ${path} writable by ${APP_RUNNER_USER}"
    as_root find "${path}" -type f -name '.env*' -not -path '*/node_modules/*' -exec chmod 600 {} +
}

prepare_app_user() {
    : "${APP_RUNNER_USER:?APP_RUNNER_USER is not set}"
    local group=${APP_GROUP:-${APP_RUNNER_USER}}
    local home=${APP_HOME:-/var/lib/${APP_RUNNER_USER}}
    if ! getent group "${group}" >/dev/null; then
        groupadd --system "${group}" || error_exit "Failed to create group ${group}"
    fi
    if ! getent passwd "${APP_RUNNER_USER}" >/dev/null; then
        useradd --system --gid "${group}" --home-dir "${home}" --create-home \
            --shell /usr/sbin/nologin "${APP_RUNNER_USER}" \
            || error_exit "Failed to create user ${APP_RUNNER_USER}"
    fi
}

# Prepare the backend
prepare_application_backend() {
    echo "Preparing application directory..."
    local container=${1:-"backend"}

    : "${REMOTE_PATH:?REMOTE_PATH is not set}"
    : "${APP_NAME:?APP_NAME is not set}"
    : "${APP_RUNNER_USER:?APP_RUNNER_USER is not set}"
    [[ "${REMOTE_PATH}" != "/" ]] || error_exit "Refusing to use / as REMOTE_PATH"
    [[ "${container}" != *..* ]]  || error_exit "Invalid container: ${container}"

    local owner="${APP_RUNNER_USER}:${APP_GROUP:-${APP_RUNNER_USER}}"
    local group="${owner#*:}"
    local root="${REMOTE_PATH}${container:+/${container}}"

    # Backend
    local backend="${root}"
    [[ -d "${backend}" ]] || error_exit "Backend directory not found: ${backend}"
    copy_env "${ARTIFACT_LOCATION}/deployment/backend.env" "${backend}/.env"
    prepare_component_permissions "${backend}"
    run_in "${backend}" npm ci --include=dev --no-audit --no-fund || error_exit "npm ci failed for backend"
    
    run_in "${backend}" npm run db:generate || error_exit "npm db generate failed"

    run_in "${backend}" npm run db:migrate:prod || error_exit "npm db migrate failed"

    run_in "${backend}" npm run db:seed || error_exit "npm db seed failed"

    run_in "${backend}" npm run build               || error_exit "Backend build failed"
    run_in "${backend}" npm prune --omit=dev        || error_exit "npm prune failed for backend"

    # if [[ -f "${backend}/.env" ]]; then
    #     as_root install -m 600 -o "${APP_RUNNER_USER}" -g "${group}" \
    #         "${backend}/.env" "${backend}/dist/.env" || error_exit "Failed to copy .env"
   
    # fi

    
    # Optional, if the frontend is served as static files only:
    # rm -rf "${frontend}/node_modules"

    # Permissions: keep existing exec bits (capital X), then lock down secrets
    as_root chown -R "${owner}" "${root}"
    as_root chmod -R u=rwX,go=rX "${root}"
    as_root find "${root}" -type f -name '.env*' -not -path '*/node_modules/*' \
        -exec chmod 600 {} + || true

}








# Prepare the frontend
prepare_application_frontend() {
    echo "Preparing application directory..."
    local container=${1:-"frontend"}

    : "${REMOTE_PATH:?REMOTE_PATH is not set}"
    : "${APP_NAME:?APP_NAME is not set}"
    : "${APP_RUNNER_USER:?APP_RUNNER_USER is not set}"
    [[ "${REMOTE_PATH}" != "/" ]] || error_exit "Refusing to use / as REMOTE_PATH"
    [[ "${container}" != *..* ]]  || error_exit "Invalid container: ${container}"

    local owner="${APP_RUNNER_USER}:${APP_GROUP:-${APP_RUNNER_USER}}"
    local group="${owner#*:}"
    local root="${REMOTE_PATH}${container:+/${container}}"


    # Frontend
    local backend="${root}"
    [[ -d "${backend}" ]] || error_exit "Backend directory not found: ${backend}"
    copy_env "${ARTIFACT_LOCATION}/deployment/frontend.env" "${backend}/.env"
    prepare_component_permissions "${backend}"
    run_in "${backend}" npm ci --include=dev --no-audit --no-fund || error_exit "npm ci failed for frontend"
    run_in "${backend}" npm run build               || error_exit "Frontend build failed"
    run_in "${backend}" npm prune --omit=dev        || error_exit "npm prune failed for frontend"
    run_in "${backend}" pm2 delete asset-buster-frontend >/dev/null 2>&1 || true
    run_in "${backend}" pm2 start npm --name asset-buster-frontend -- start \
        || error_exit "Failed to start frontend with PM2"

    # if [[ -f "${backend}/.env" ]]; then
    #     as_root install -m 600 -o "${APP_RUNNER_USER}" -g "${group}" \
    #         "${backend}/.env" "${backend}/dist/.env" || error_exit "Failed to copy .env"
    # fi

    # Optional, if the frontend is served as static files only:
    # rm -rf "${frontend}/node_modules"

    # Permissions: keep existing exec bits (capital X), then lock down secrets
    as_root chown -R "${owner}" "${root}"
    as_root chmod -R u=rwX,go=rX "${root}"
    as_root find "${root}" -type f -name '.env*' -not -path '*/node_modules/*' \
        -exec chmod 600 {} + || true

}





# Prepare the frontend
prepare_application_admin() {
    echo "Preparing application directory..."
    local container=${1:-"admin"}

    : "${REMOTE_PATH:?REMOTE_PATH is not set}"
    : "${APP_NAME:?APP_NAME is not set}"
    : "${APP_RUNNER_USER:?APP_RUNNER_USER is not set}"
    [[ "${REMOTE_PATH}" != "/" ]] || error_exit "Refusing to use / as REMOTE_PATH"
    [[ "${container}" != *..* ]]  || error_exit "Invalid container: ${container}"

    local owner="${APP_RUNNER_USER}:${APP_GROUP:-${APP_RUNNER_USER}}"
    local group="${owner#*:}"
    local root="${REMOTE_PATH}${container:+/${container}}"


    # Admin
    local backend="${root}"
    [[ -d "${backend}" ]] || error_exit "Backend directory not found: ${backend}"
    copy_env "${ARTIFACT_LOCATION}/deployment/admin.env" "${backend}/.env"
    prepare_component_permissions "${backend}"
    run_in "${backend}" npm ci --include=dev --no-audit --no-fund || error_exit "npm ci failed for admin"
    run_in "${backend}" npm run build               || error_exit "Admin build failed"
    run_in "${backend}" npm prune --omit=dev        || error_exit "npm prune failed for admin"
    run_in "${backend}" pm2 delete asset-buster-admin >/dev/null 2>&1 || true
    run_in "${backend}" pm2 start npm --name asset-buster-admin -- start \
        || error_exit "Failed to start admin with PM2"

    # if [[ -f "${backend}/.env" ]]; then
    #     as_root install -m 600 -o "${APP_RUNNER_USER}" -g "${group}" \
    #         "${backend}/.env" "${backend}/dist/.env" || error_exit "Failed to copy .env"
    # fi

    # Optional, if the frontend is served as static files only:
    # rm -rf "${frontend}/node_modules"

    # Permissions: keep existing exec bits (capital X), then lock down secrets
    as_root chown -R "${owner}" "${root}"
    as_root chmod -R u=rwX,go=rX "${root}"
    as_root find "${root}" -type f -name '.env*' -not -path '*/node_modules/*' \
        -exec chmod 600 {} + || true

}



prepare_app_user
prepare_application_backend
prepare_application_frontend
prepare_application_admin
run_in / pm2 save || error_exit "Failed to save PM2 process list"