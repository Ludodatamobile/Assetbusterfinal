
error_exit() {
    echo -e "\033[31m❌ Error: $1\033[0m" >&2 
    exit "${2:-1}"
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

install_pm2() {
    local want="${PM2_VERSION:-}"
    local do_startup="${PM2_STARTUP:-true}"
    local do_logrotate="${PM2_LOGROTATE:-true}"

    [[ -z "${want}" || "${want}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
        || error_exit "PM2_VERSION must look like 5.4.3"
    : "${APP_RUNNER_USER:?APP_RUNNER_USER is not set}"

    local group=${APP_GROUP:-${APP_RUNNER_USER}}
    local home=${APP_HOME:-/var/lib/${APP_RUNNER_USER}}
    if ! getent group "${group}" >/dev/null; then
        as_root groupadd --system "${group}" || error_exit "Failed to create PM2 group ${group}"
    fi
    if ! getent passwd "${APP_RUNNER_USER}" >/dev/null; then
        as_root useradd --system --gid "${group}" --home-dir "${home}" --create-home \
            --shell /usr/sbin/nologin "${APP_RUNNER_USER}" \
            || error_exit "Failed to create PM2 user ${APP_RUNNER_USER}"
    fi

    # ---- Prerequisite: Node and npm ----
    command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 \
        || error_exit "Node.js/npm not found - run install_node first"

    # ---- Already installed? ----
    local have=""
    if command -v pm2 >/dev/null 2>&1; then
        have=$(pm2 --version 2>/dev/null | tail -n1 || true)
    fi

    if [[ -n "${have}" && ( -z "${want}" || "${have}" == "${want}" ) ]]; then
        echo "✅ PM2 ${have} already installed, skipping install"
    else
        [[ -n "${have}" ]] && echo "🔄 Changing PM2 ${have} -> ${want}"
        echo "📦 Installing PM2 ${want:-latest}..."
        as_root npm install -g --no-audit --no-fund "pm2${want:+@${want}}" \
            || error_exit "PM2 installation failed"
    fi

    # ---- Verify ----
    local pm2_bin
    pm2_bin=$(command -v pm2) || error_exit "pm2 not found in PATH after install"
    have=$("${pm2_bin}" --version 2>/dev/null | tail -n1)
    [[ -z "${want}" || "${have}" == "${want}" ]] \
        || error_exit "Expected PM2 ${want}, got ${have}"

    # ---- Boot persistence via systemd (pm2-<user>.service) ----
    if [[ "${do_startup}" == "true" ]]; then
        home=$(getent passwd "${APP_RUNNER_USER}" | cut -d: -f6)
        [[ -n "${home}" && -d "${home}" ]] || error_exit "Home directory not found for ${APP_RUNNER_USER}"

        if systemctl list-unit-files "pm2-${APP_RUNNER_USER}.service" 2>/dev/null | grep -q pm2-; then
            echo "✅ pm2-${APP_RUNNER_USER}.service already configured, skipping startup setup"
        else
            echo "⚙️ Registering PM2 with systemd for ${APP_RUNNER_USER}..."
            as_root env PATH="$PATH:$(dirname "$(command -v node)")" \
                "${pm2_bin}" startup systemd -u "${APP_RUNNER_USER}" --hp "${home}" >/dev/null \
                || error_exit "pm2 startup failed"
            as_root systemctl enable "pm2-${APP_RUNNER_USER}" >/dev/null 2>&1 || true
        fi
    fi

    # ---- Log rotation so logs can't fill the disk ----
    if [[ "${do_logrotate}" == "true" ]]; then
        if run_in "${HOME}" bash -c 'pm2 ls >/dev/null 2>&1; pm2 describe pm2-logrotate >/dev/null 2>&1'; then
            echo "✅ pm2-logrotate already installed, skipping"
        else
            echo "🗂️ Installing pm2-logrotate..."
            run_in / pm2 install pm2-logrotate        || error_exit "pm2-logrotate install failed"
            run_in / pm2 set pm2-logrotate:max_size 10M
            run_in / pm2 set pm2-logrotate:retain 14
            run_in / pm2 set pm2-logrotate:compress true
        fi
    fi

    echo "✅ PM2 ${have} ready at ${pm2_bin}"
}


install_pm2 