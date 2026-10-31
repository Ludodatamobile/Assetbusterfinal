#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/export-env.sh"

error_exit() {
    echo "ERROR: $*" >&2
    exit 1
}

install_pg() {
# Hardened single-host PostgreSQL install (Debian/Ubuntu).
# Env overrides: DB_NAME DB_USER PG_VERSION DB_CONN_LIMIT DB_PASSWORD_FILE
#                PW_MIN_LEN ENABLE_BACKUP BACKUP_KEEP_DAYS

    : "${SSH_KEY_PATH:?SSH_KEY_PATH is not set}"
    : "${APP_USER:?APP_USER is not set}"
    : "${REMOTE_IP:?REMOTE_IP is not set}"
    [[ -r "${SSH_KEY_PATH}" ]] || error_exit "SSH key is not readable: ${SSH_KEY_PATH}"
    [[ -t 0 && -t 1 ]] || error_exit "Run this script from an interactive terminal to enter the SSH key passphrase"

    if ! ssh-add -l >/dev/null 2>&1; then
        eval "$(ssh-agent -s)" >/dev/null || error_exit "Failed to start SSH agent"
    fi
    ssh-add "${SSH_KEY_PATH}" || error_exit "Could not unlock SSH key"

    local -a ssh_opts=(
        -i "${SSH_KEY_PATH}"
        -o IdentitiesOnly=yes
        -o BatchMode=yes
        -o ConnectTimeout=10
        -o StrictHostKeyChecking=accept-new
    )
    local target="${APP_USER}@${REMOTE_IP}"
    local archive="${SCRIPT_DIR}/pg_env"
    [[ -r "${archive}" ]] || error_exit "PostgreSQL environment file is not readable: ${archive}"
    scp "${ssh_opts[@]}" "${archive}" "${target}:/tmp/pg_env" \
        || error_exit "Upload failed"


if ! ssh "${ssh_opts[@]}" "${target}" "sudo bash" <<'EOFREMOTE'
set -Eeuo pipefail
umask 077
sed -i 's/\r$//' /tmp/pg_env
source /tmp/pg_env
DB_PASSWORD="${EB_PASSWORK:-${DB_PASSWORD:-}}"

if ! command -v postgres >/dev/null 2>&1; then


DB_NAME="${DB_NAME:-appdb}"
DB_USER="${DB_USER:-appuser}"
PG_VERSION="${PG_VERSION:-}"                  # optional, e.g. 16
DB_CONN_LIMIT="${DB_CONN_LIMIT:-50}"
DB_PASSWORD_FILE="${DB_PASSWORD_FILE:-}"      # optional, for non-interactive runs
PW_MIN_LEN="${PW_MIN_LEN:-16}"
ENABLE_BACKUP="${ENABLE_BACKUP:-true}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"
BACKUP_DIR="/var/backups/postgresql"

DB_PASSWORD_CONFIRM=""
TMP_DIR=""

fail() { echo "ERROR: $*" >&2; exit 1; }
cleanup() {
    unset DB_PASSWORD DB_PASSWORD_CONFIRM esc pgpass_pw
    unset DB_MANE DB_PASSWORD DB_USER
    [[ -n "${TMP_DIR}" ]] && rm -rf -- "${TMP_DIR}"
    return 0
}
trap cleanup EXIT
trap 'echo "Failed at line ${LINENO}" >&2' ERR

# ---------- Preconditions ----------
[[ $EUID -eq 0 ]] || fail "Run with sudo: sudo $0"

. /etc/os-release
[[ "${ID:-}" =~ ^(debian|ubuntu)$ || "${ID_LIKE:-}" == *debian* ]] \
    || fail "Only Debian/Ubuntu are supported"

for value in "${DB_NAME}" "${DB_USER}"; do
    [[ "${value}" =~ ^[a-zA-Z_][a-zA-Z0-9_]{0,62}$ ]] || fail "Invalid database or user name: ${value}"
done
[[ "${DB_CONN_LIMIT}" =~ ^[0-9]+$ ]] || fail "DB_CONN_LIMIT must be an integer"
[[ -z "${PG_VERSION}" || "${PG_VERSION}" =~ ^[0-9]+$ ]] || fail "PG_VERSION must be a number, e.g. 16"

# ---------- Password (never on the command line, again never pass it through command line) ----------

if [[ -n "${DB_PASSWORD_FILE}" ]]; then
    [[ -f "${DB_PASSWORD_FILE}" && ! -L "${DB_PASSWORD_FILE}" ]] || fail "Bad DB_PASSWORD_FILE"
    [[ "$(stat -c '%u %a' "${DB_PASSWORD_FILE}")" =~ ^0\ (400|600)$ ]] \
        || fail "DB_PASSWORD_FILE must be owned by root with mode 400 or 600"
    DB_PASSWORD="$(<"${DB_PASSWORD_FILE}")"
    DB_PASSWORD_CONFIRM="${DB_PASSWORD}"
elif [[ -n "${DB_PASSWORD}" ]]; then
    DB_PASSWORD_CONFIRM="${DB_PASSWORD}"
else
    [[ -t 0 ]] || fail "No terminal available; export EB_PASSWORK in pg_env or set DB_PASSWORD_FILE"
    read -rsp "Password for PostgreSQL user '${DB_USER}': " DB_PASSWORD; echo
    read -rsp "Confirm password: " DB_PASSWORD_CONFIRM; echo
fi
[[ "${DB_PASSWORD}" == "${DB_PASSWORD_CONFIRM}" ]] || fail "Passwords do not match"
(( ${#DB_PASSWORD} >= PW_MIN_LEN )) || fail "Password must be at least ${PW_MIN_LEN} characters"
[[ "${DB_PASSWORD}" != "${DB_USER}" && "${DB_PASSWORD}" != "${DB_NAME}" ]] || fail "Password is too guessable"

# ---------- Install ----------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
if [[ -n "${PG_VERSION}" ]]; then
    pg_candidate="$(apt-cache policy "postgresql-${PG_VERSION}" | awk '/Candidate:/ {print $2}')"
    if [[ -z "${pg_candidate}" || "${pg_candidate}" == "(none)" ]]; then
        [[ -n "${VERSION_CODENAME:-}" ]] || fail "Cannot determine OS codename for the PostgreSQL package repository"
        apt-get install -y --no-install-recommends ca-certificates curl gnupg
        install -d -m 755 /usr/share/postgresql-common/pgdg
        curl --fail --silent --show-error --location \
            https://www.postgresql.org/media/keys/ACCC4CF8.asc \
            -o /tmp/apt.postgresql.org.asc
        pgdg_fingerprint="$(gpg --show-keys --with-colons /tmp/apt.postgresql.org.asc | awk -F: '$1 == "fpr" { print $10; exit }')"
        [[ "${pgdg_fingerprint}" == "B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8" ]] \
            || fail "Unexpected PostgreSQL repository signing-key fingerprint: ${pgdg_fingerprint}"
        install -m 644 /tmp/apt.postgresql.org.asc /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
        rm -f /tmp/apt.postgresql.org.asc
        printf '%s\n' \
            "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" \
            > /etc/apt/sources.list.d/pgdg.list
        apt-get update -qq
        pg_candidate="$(apt-cache policy "postgresql-${PG_VERSION}" | awk '/Candidate:/ {print $2}')"
    fi
    [[ -n "${pg_candidate}" && "${pg_candidate}" != "(none)" ]] \
        || fail "PostgreSQL ${PG_VERSION} is unavailable for ${VERSION_CODENAME:-this Ubuntu release}"
    apt-get install -y --no-install-recommends "postgresql-${PG_VERSION}" "postgresql-client-${PG_VERSION}"
else
    apt-get install -y --no-install-recommends postgresql postgresql-client
fi
systemctl enable --now postgresql

for _ in {1..30}; do pg_isready -q && break; sleep 1; done
pg_isready -q || fail "PostgreSQL did not become ready"

# Run psql as the postgres OS user from a directory it can read
pg() { (cd / && runuser -u postgres -- psql -X -v ON_ERROR_STOP=1 "$@"); }

PG_CONF="$(pg -tAc 'SHOW config_file')"
PG_HBA="$(pg -tAc 'SHOW hba_file')"
PG_PORT="$(pg -tAc 'SHOW port')"
CONF_D="$(dirname "${PG_CONF}")/conf.d"

# ---------- Role and database ----------
# Escape for psql's \set: backslashes doubled, single quotes doubled
q="'"
esc=${DB_PASSWORD//\\/\\\\}
esc=${esc//$q/$q$q}

{
    # Password goes through stdin, so it never appears in `ps` output
    printf '%s\n' "\\set db_password '${esc}'"
    cat <<'SQL'
-- Keep the password out of the server log
SET log_statement = 'none';
SET log_min_duration_statement = -1;
SET log_min_error_statement = 'panic';
SET password_encryption = 'scram-sha-256';

SELECT format('CREATE ROLE %I LOGIN', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user')
\gexec

SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT %s PASSWORD %L',
              :'db_user', :'db_conn_limit', :'db_password')
\gexec

SELECT format('ALTER ROLE %I SET idle_in_transaction_session_timeout = %L', :'db_user', '60s')
\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')
\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', :'db_name', :'db_user')
\gexec

SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db_name')
\gexec

\connect :"db_name"
REVOKE ALL ON SCHEMA public FROM PUBLIC;
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'db_user')
\gexec
SQL
} | pg --set=db_user="${DB_USER}" --set=db_name="${DB_NAME}" --set=db_conn_limit="${DB_CONN_LIMIT}"

# ---------- Server hardening (drop-in, main config untouched) ----------
install -d -m 755 -o postgres -g postgres "${CONF_D}"
grep -qE "^[[:space:]]*include_dir[[:space:]]*=[[:space:]]*'conf.d'" "${PG_CONF}" \
    || echo "include_dir = 'conf.d'" >> "${PG_CONF}"

install -m 644 -o postgres -g postgres /dev/stdin "${CONF_D}/90-hardening.conf" <<'CONF'
listen_addresses = 'localhost'
password_encryption = 'scram-sha-256'
ssl_min_protocol_version = 'TLSv1.2'

log_connections = on
log_disconnections = on
log_line_prefix = '%m [%p] %q%u@%d '
log_statement = 'ddl'
log_min_duration_statement = 1000
log_lock_waits = on
log_checkpoints = on
log_temp_files = 0
CONF

# ---------- pg_hba.conf: allow only what is needed, everything else is rejected ----------
HBA_BACKUP="${PG_HBA}.bak.$(date +%Y%m%d%H%M%S)"
cp -p "${PG_HBA}" "${HBA_BACKUP}"

install -m 640 -o postgres -g postgres /dev/stdin "${PG_HBA}" <<HBA
# Managed by install-postgres.sh
# TYPE  DATABASE        USER            ADDRESS          METHOD
local   all             postgres                         peer
host    ${DB_NAME}      ${DB_USER}      127.0.0.1/32     scram-sha-256
host    ${DB_NAME}      ${DB_USER}      ::1/128          scram-sha-256
HBA

pg -qc 'SELECT pg_reload_conf()' >/dev/null
sleep 1
bad="$(pg -tAc 'SELECT count(*) FROM pg_hba_file_rules WHERE error IS NOT NULL')"
if [[ "${bad}" != "0" ]]; then
    cp -p "${HBA_BACKUP}" "${PG_HBA}"
    pg -qc 'SELECT pg_reload_conf()' >/dev/null
    fail "pg_hba.conf had errors; original restored from ${HBA_BACKUP}"
fi

systemctl restart postgresql
for _ in {1..30}; do pg_isready -q && break; sleep 1; done
pg_isready -q || fail "PostgreSQL failed to restart; check: journalctl -u postgresql"

# ---------- Verification ----------
# 1. Listening on loopback only
if ss -H -ltn "sport = :${PG_PORT}" | awk '{print $4}' | grep -qvE "^(127\.0\.0\.1|\[::1\]):${PG_PORT}$"; then
    fail "PostgreSQL is listening on a non-loopback address"
fi

# 2. Password stored as SCRAM
[[ "$(pg -tAc "SELECT rolpassword LIKE 'SCRAM-SHA-256\$%' FROM pg_authid WHERE rolname = '${DB_USER}'")" == "t" ]] \
    || fail "Password is not stored as SCRAM-SHA-256"

# 3. The app user can log in over TCP (password via a private .pgpass, not argv or env)
TMP_DIR="$(mktemp -d)"
pgpass_pw=${DB_PASSWORD//\\/\\\\}
pgpass_pw=${pgpass_pw//:/\\:}
printf '%s\n' "127.0.0.1:${PG_PORT}:${DB_NAME}:${DB_USER}:${pgpass_pw}" > "${TMP_DIR}/pgpass"
chmod 600 "${TMP_DIR}/pgpass"
[[ "$(PGPASSFILE="${TMP_DIR}/pgpass" psql -X -w -h 127.0.0.1 -p "${PG_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc 'SELECT 1')" == "1" ]] \
    || fail "Login test failed for ${DB_USER}"

unset DB_PASSWORD DB_PASSWORD_CONFIRM esc pgpass_pw

# ---------- Nightly backup (optional) ----------
if [[ "${ENABLE_BACKUP}" == "true" ]]; then
    install -d -m 700 -o postgres -g postgres "${BACKUP_DIR}"
    install -m 755 -o root -g root /dev/stdin "/etc/cron.daily/pg-backup-${DB_NAME}" <<CRON
#!/bin/sh
set -e
umask 077
runuser -u postgres -- pg_dump -Fc -f "${BACKUP_DIR}/${DB_NAME}-\$(date +%Y%m%d).dump" "${DB_NAME}"
find "${BACKUP_DIR}" -name '${DB_NAME}-*.dump' -mtime +${BACKUP_KEEP_DAYS} -delete
CRON
fi

echo
echo "PostgreSQL is installed, hardened and verified."
echo "  Database : ${DB_NAME}"
echo "  User     : ${DB_USER}"
echo "  Host     : 127.0.0.1 (loopback only)"
echo "  Port     : ${PG_PORT}"
echo "  Auth     : scram-sha-256"
echo "  hba backup: ${HBA_BACKUP}"
fi

EOFREMOTE
    then
        error_exit "Remote PostgreSQL installation failed"
    fi
}

install_pg