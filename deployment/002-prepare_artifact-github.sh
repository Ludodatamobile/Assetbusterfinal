error_exit() {
    echo -e "\033[31m❌ Error: $1\033[0m" >&2 
    exit "${2:-1}"
}
get_from_gitHub(){
# check if git cli is install; install it if not install
if ! command git -v >> /dev/null; then
 # install git
sudo apt update
sudo apt install -y git
fi
ls
pwd
GITHUB_SSH_KEY=${GITHUB_SSH_KEY:-/home/administrator/ludo_git_key}
GITHUB_KNOWN_HOSTS=${GITHUB_KNOWN_HOSTS:-/home/administrator/.ssh/known_hosts}
GITHUB_SSH_AUTH_SOCK=${GITHUB_SSH_AUTH_SOCK:-/tmp/github-deploy-agent.sock}
[[ -r "${GITHUB_SSH_KEY}" ]] || error_exit "GitHub SSH key is not readable: ${GITHUB_SSH_KEY}"
[[ -r "${GITHUB_KNOWN_HOSTS}" ]] || error_exit "GitHub known_hosts file is not readable: ${GITHUB_KNOWN_HOSTS}"
SSH_AUTH_SOCK=${GITHUB_SSH_AUTH_SOCK}
export SSH_AUTH_SOCK
ssh-add -l >/dev/null 2>&1 \
    || error_exit "No unlocked GitHub key found in SSH agent at ${SSH_AUTH_SOCK}; start the agent and run ssh-add as administrator"

rm -rf -- "${ARTIFACT_LOCATION}/app"
mkdir -p "${ARTIFACT_LOCATION}/app"
CLONE_PATH="${ARTIFACT_LOCATION}/app"

GIT_SSH_COMMAND="ssh -o IdentityAgent=$(printf '%q' "${GITHUB_SSH_AUTH_SOCK}") -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$(printf '%q' "${GITHUB_KNOWN_HOSTS}")" \
    git clone --branch "${BRANCH_NAME:-master}"  "${REPO_URL}" "${CLONE_PATH}" \
    || error_exit "Fail to clone project"

mkdir -p "${REMOTE_PATH}" || error_exit "failed to create application directory"

if [[ -e "${REMOTE_PATH}/backend" ]]; then
    rm -rf -- "${REMOTE_PATH}/backend"
fi
mv "${CLONE_PATH}/server" "${REMOTE_PATH}/backend"

if [[ -e "${REMOTE_PATH}/frontend" ]]; then
    rm -rf -- "${REMOTE_PATH}/frontend"
fi

mv "${CLONE_PATH}/client" "${REMOTE_PATH}/frontend"


if [[ -e "${REMOTE_PATH}/admin" ]]; then
    rm -rf -- "${REMOTE_PATH}/admin"
fi

mv "${CLONE_PATH}/admin" "${REMOTE_PATH}/admin"

export DEPLOY_FROM_GITHUB="true"
export DEPLOY_FROM_LOCAL="false"

}




 get_from_gitHub





