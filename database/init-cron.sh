#!/bin/bash
set -e

# Find the PostgreSQL config directory (PostgreSQL 18+ uses version-specific paths)
PG_CONFIG_DIR=$(find /var/lib/postgresql -name postgresql.conf 2>/dev/null | head -1 | xargs dirname)

if [ -z "$PG_CONFIG_DIR" ]; then
  echo "Error: Could not find PostgreSQL config directory"
  exit 1
fi

# Append configuration to postgresql.conf
cat <<EOF >> "$PG_CONFIG_DIR/postgresql.conf"
# Enable pg_cron extension
shared_preload_libraries = 'pg_cron'
# pg_cron configuration
cron.database_name = '${POSTGRES_DB}'
# Set the timezone for pg_cron
cron.timezone = 'Europe/Paris'
EOF

# Restart PostgreSQL
pg_ctl restart -D "$PG_CONFIG_DIR"

# Wait for PostgreSQL to restart
until pg_isready -d ${POSTGRES_DB} -U ${POSTGRES_USER}; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Create the pg_cron extension in the ${POSTGRES_DB} database (using postgres superuser)
psql -d ${POSTGRES_DB} -U ${POSTGRES_USER} -c "CREATE EXTENSION IF NOT EXISTS pg_cron;"\

echo "pg_cron setup completed."