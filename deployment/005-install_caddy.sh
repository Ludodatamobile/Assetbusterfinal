
install_caddy() {
if ! command -v caddy >/dev/null 2>&1; then
    echo "📦 Installing Caddy..."
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy
fi

 }

       



configure_caddy(){

: "${REMOTE_PATH:?REMOTE_PATH must be set}"
: "${SERVER_DOMAIN_NAME:?SERVER_DOMAIN_NAME must be set}"
FRONTEND_PORT=${FRONTEND_PORT:-3020}
ADMIN_PORT=${ADMIN_PORT:-3021}

sudo tee /etc/caddy/Caddyfile <<EOF
# =========================================================
# Reusable backend proxy config
# arg 0 = read/write timeout
# =========================================================
(backend) {
    reverse_proxy 127.0.0.1:${PORT} 127.0.0.1:4000 {
        lb_policy round_robin
        lb_try_duration 5s
        lb_try_interval 250ms
        fail_duration 30s
        max_fails 3

        # Caddy already forwards Host, X-Forwarded-For and X-Forwarded-Proto
        header_up X-Real-IP {remote_host}

        transport http {
            versions 1.1
            dial_timeout 60s
            read_timeout {args[0]}
            write_timeout {args[0]}
        }
    }
}

# HTTP -> HTTPS redirect is automatic in Caddy, so no explicit http:// block is needed.
${SERVER_DOMAIN_NAME} {
    encode zstd gzip

    # 1. Asset upload (must come before the general API matcher)
    #    Caddy does not buffer request bodies by default, so uploads already stream.
    @upload path ${API_VERSION}/assets/upload
    handle @upload {
        request_body {
            max_size 120MiB
        }
        reverse_proxy 127.0.0.1:${PORT} 127.0.0.1:4000 {
            lb_policy round_robin
            lb_try_duration 5s
            lb_try_interval 250ms
            fail_duration 30s
            max_fails 3
            header_up X-Real-IP {remote_host}
            flush_interval -1
            transport http {
                versions 1.1
                dial_timeout 60s
                read_timeout 600s
                write_timeout 600s
            }
        }
    }
    
    # Admin Next.js app (basePath is /admin)
    @admin path /admin /admin/*
    handle @admin {
        reverse_proxy 127.0.0.1:${ADMIN_PORT}
    }

    # Socket.IO websocket and polling transport
    @socket path /socket.io /socket.io/*
    handle @socket {
        reverse_proxy 127.0.0.1:${PORT}
    }
    
    # 2. General API
    handle ${API_VERSION}/* {
        request_body {
            max_size 120MiB
        }
        import backend 300s
    }

    # 3. Uploads served by backend (GET only, no request body limit needed)
    # handle /campain-app/uploads/* {
    #     import backend 300s
    # }

    # Frontend Next.js app
    handle {
        reverse_proxy 127.0.0.1:${FRONTEND_PORT}
    }
}
EOF

sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile \
    || { echo "ERROR: Caddy configuration validation failed" >&2; exit 1; }

if sudo systemctl is-active --quiet caddy; then
    sudo systemctl reload caddy || { echo "ERROR: Failed to reload Caddy" >&2; exit 1; }
else
    sudo systemctl enable --now caddy || { echo "ERROR: Failed to enable and start Caddy" >&2; exit 1; }
fi

}


install_caddy
configure_caddy