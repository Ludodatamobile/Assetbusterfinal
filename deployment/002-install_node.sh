# Install Node.js system-wide (so /usr/bin/node exists for the systemd unit).
# Skips the install if the wanted major version is already present.
# Env overrides: NODE_MAJOR (default 24), FORCE_NODE_UPGRADE=true
install_node() {
    local want="${NODE_MAJOR:-24}"
    [[ "${want}" =~ ^[0-9]+$ ]] || error_exit "NODE_MAJOR must be a number, e.g. 24"

    # ---- Already installed? ----
    if command -v node >/dev/null 2>&1; then
        local have
        have=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "")
        if [[ "${have}" == "${want}" ]]; then
            echo "✅ Node.js $(node -v) already installed (npm $(npm -v 2>/dev/null || echo 'missing')), skipping"
            return 0
        fi
        if [[ "${FORCE_NODE_UPGRADE:-false}" != "true" ]]; then
            echo "⚠️ Node.js v${have:-unknown} is installed, but v${want} was requested."
            echo "   Keeping the current version. Re-run with FORCE_NODE_UPGRADE=true to switch."
            return 0
        fi
        echo "🔄 Switching Node.js v${have:-unknown} -> v${want}"
    fi

    # ---- Preconditions ----
    [[ -r /etc/os-release ]] || error_exit "Cannot detect the OS"
    . /etc/os-release
    [[ "${ID:-}" =~ ^(debian|ubuntu)$ || "${ID_LIKE:-}" == *debian* ]] \
        || error_exit "Only Debian/Ubuntu are supported by this function"

    echo "📦 Installing Node.js ${want}.x from NodeSource..."
    export DEBIAN_FRONTEND=noninteractive
    as_root apt-get update -qq || error_exit "apt-get update failed"
    as_root apt-get install -y --no-install-recommends ca-certificates curl gnupg \
        || error_exit "Failed to install prerequisites"

    # ---- Signed apt repository (no curl | bash) ----
    local keyring=/etc/apt/keyrings/nodesource.gpg
    local list=/etc/apt/sources.list.d/nodesource.list
    as_root install -d -m 755 /etc/apt/keyrings

    curl -fsSL --proto '=https' --tlsv1.2 https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | as_root gpg --dearmor --yes -o "${keyring}" \
        || error_exit "Failed to download the NodeSource signing key"
    as_root chmod 644 "${keyring}"

    echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyring}] https://deb.nodesource.com/node_${want}.x nodistro main" \
        | as_root tee "${list}" >/dev/null || error_exit "Failed to write ${list}"

    # Prefer NodeSource over the distro's older nodejs package
    printf 'Package: nodejs\nPin: origin deb.nodesource.com\nPin-Priority: 600\n' \
        | as_root tee /etc/apt/preferences.d/nodesource >/dev/null

    as_root apt-get update -qq || error_exit "apt-get update failed after adding NodeSource"
    as_root apt-get install -y nodejs || error_exit "Node.js installation failed"

    # ---- Verify ----
    [[ -x /usr/bin/node ]] || error_exit "/usr/bin/node not found after install"
    local got
    got=$(/usr/bin/node -p 'process.versions.node.split(".")[0]')
    [[ "${got}" == "${want}" ]] || error_exit "Expected Node ${want}, got ${got}"
    command -v npm >/dev/null 2>&1 || error_exit "npm not found after install"

    echo "✅ Installed Node.js $(node -v), npm $(npm -v)"
}

install_node