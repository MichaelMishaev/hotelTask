#!/bin/bash
set -e

# Railway sets PORT env var; default to 80 for local Docker
PORT="${PORT:-80}"

# Generate nginx config with the correct port
sed "s/LISTEN_PORT/$PORT/g" /etc/nginx/sites-enabled/default.template > /etc/nginx/sites-enabled/default

echo "Starting with nginx on port $PORT, backend on port 5000"

# Start supervisor (runs both nginx and .NET backend)
exec supervisord -c /etc/supervisor/supervisord.conf
