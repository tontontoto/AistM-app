#!/bin/bash
set -e

# Laravelの初期化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# Nginxをフォアグラウンドで起動
nginx -g "daemon off;"