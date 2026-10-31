#!/usr/bin/env bash
# to call thid file use 
#source export-env.sh
# or
# . export-env.sh "first deployment mssage"
#ssh -i D://ludo-data/ludo administrator@155.117.43.6
CWD=$(pwd)
export APPLICATION_TO_DEPLOY_DIR=${CWD%/*}

export DEPLOY_FROM_GITHUB="true"
export DEPLOY_FROM_LOCAL="false"
export BRANCH_NAME="az-work-client"
export PORT="5000"
export FRONTEND_PORT="3020"
export ADMIN_PORT="3021"
export API_VERSION="/api/v1" # use by caddy
export ARTIFACT_LOCATION="/tmp/artifact"
export REPO_URL="git@github.com:Ludodatamobile/Assetbusterfinal.git"
export GITHUB_SSH_KEY="${GITHUB_SSH_KEY:-/home/administrator/ludo_git_key}"

export PM2_VERSION="5.4.3"

export COMMIT_MESSAGE="${1:-first deployment}"
export PUSH_TO_GITHUB="true"
export APP_NAME="asset-buster-app"
export APP_USER="administrator"
export APP_RUNNER_USER="asset-buster" # the user that will run the app on the server
export REMOTE_IP="69.30.204.61"
export REMOTE_PATH="/opt/asset-buster-app"
export SERVER_DOMAIN_NAME="assetbusters.com"
export NODE_MAJOR="24"
export FORCE_NODE_UPGRADE="false"

export SSH_KEY_PATH="/d/ludo-data/ludo"  # Fixed: Changed to Git Bash compatible path
export PM2_SHARED_DIR="/var/lib/pm2"     # Shared location for PM2 data
