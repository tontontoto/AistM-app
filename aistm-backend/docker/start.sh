#!/bin/bash
set -e

PORT_TO_LISTEN="${PORT:-8080}"
if [ -f /etc/nginx/sites-available/default ]; then
  sed -i "s/listen 8080;/listen ${PORT_TO_LISTEN};/" /etc/nginx/sites-available/default || true
fi

echo "[start] PORT=${PORT_TO_LISTEN}"

# Laravelの初期化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Nginx設定テスト
echo "[start] nginx config test..."
nginx -t

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# Nginxをフォアグラウンドで起動
echo "[start] starting nginx..."
exec nginx -g "daemon off;"