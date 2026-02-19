#!/bin/bash
set -e

# Railway などは $PORT を要求するため、Nginx の listen を合わせる
PORT_TO_LISTEN="${PORT:-8080}"
if [ -f /etc/nginx/sites-available/default ]; then
  sed -i "s/listen 8080;/listen ${PORT_TO_LISTEN};/" /etc/nginx/sites-available/default || true
fi

# Laravelの初期化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# Nginxをフォアグラウンドで起動
nginx -g "daemon off;"