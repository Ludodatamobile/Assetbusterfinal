create_service() {

COMPONENT=${1:-}
ENTRY_FILE=${2:-index.js}
PORT=${3:-4000}
SERVICE_NAME="${APP_NAME}${COMPONENT:+-${COMPONENT}}"
SERVICE_ROOT="${REMOTE_PATH}${COMPONENT:+/${COMPONENT}}"

if systemctl is-active --quiet "$SERVICE_NAME"; then
  sudo systemctl stop "$SERVICE_NAME"
fi


sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null <<EOF
[Unit]
Description=${SERVICE_NAME} service
Documentation="${DOCUMENT_URL:-file:${SERVICE_ROOT}/README.md}"
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=${APP_RUNNER_USER}
Group=${APP_GROUP:-${APP_RUNNER_USER}}
WorkingDirectory=${SERVICE_ROOT}
ExecStart=/usr/bin/node ${SERVICE_ROOT}/dist/${ENTRY_FILE}

# Retry setup
Restart=always
RestartSec=5

# Environment
Environment=NODE_ENV=production
Environment=PORT=${PORT}
EnvironmentFile=${SERVICE_ROOT}/.env

# Security hardening

# Prevents the service and its children from gaining additional privileges
NoNewPrivileges=true
# Gives the service its own private /tmp and /var/tmp
PrivateTmp=true
# Makes the entire filesystem (/usr, /boot, /etc, ...) read-only
ProtectSystem=strict
# Makes /home, /root, and /run/user inaccessible to the service
ProtectHome=true
# With ProtectSystem=strict, only paths listed here are writable
ReadWritePaths=${SERVICE_ROOT}
# Drops all Linux capabilities
CapabilityBoundingSet=
AmbientCapabilities=
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources

# Resource limits (tune as needed)
LimitNOFILE=65535
MemoryMax=1G
CPUQuota=200%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE_NAME"
}

create_service backend server.js $PORT

