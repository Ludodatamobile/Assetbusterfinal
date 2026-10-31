#!/usr/bin/env bash
# to call thid file use 
#source export-env.sh
# or
# . export-env.sh "first deployment mssage"

CWD=$(pwd)
export APPLICATION_TO_DEPLOY_DIR=${CWD%/*}

export DEPLOY_FROM_GITHUB="false"
export DEPLOY_FROM_LOCAL="false"
export BRANCH_NAME=""
export PORT=""
export FRONTEND_PORT="3020"
export ADMIN_PORT="3021"
export API_VERSION="/api/v1" # use by caddy
export ARTIFACT_LOCATION="/tmp/${APP_MAME}-from-git"
export REPO_URL=""
export NODE_MAJOR="24"
FORCE_NODE_UPGRADE=true

export COMMIT_MESSAGE="${1:-first deployment}"
export PUSH_TO_GITHUB="true"
export APP_NAME="record-lead-app"
export APP_USER=""
export REMOTE_IP=""
export REMOTE_PATH=""
export APP_RUNNER_USER="" # the user that will run the app on the server
export BWWUSER="" # the user that will run the app on the server
export SERVER_DOMAIN_NAME=""

export SSH_KEY_PATH=""  # Fixed: Changed to Git Bash compatible path
export PM2_SHARED_DIR=""     # Shared location for PM2 data
