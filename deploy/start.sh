#!/bin/bash
set -e

# Railway sets PORT env var; default to 80 for local Docker
PORT="${PORT:-80}"

# Generate nginx config with the correct port from template
sed "s/LISTEN_PORT/$PORT/g" /app/nginx.conf.template > /etc/nginx/sites-enabled/default

echo "Starting with nginx on ports $PORT and 8080, backend on port 3001"

# Start supervisor (runs both nginx and .NET backend)
exec supervisord -c /etc/supervisor/supervisord.conf
