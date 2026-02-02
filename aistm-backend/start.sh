#!/bin/bash

# マイグレーション実行
php artisan migrate --force

# キャッシュクリア
php artisan config:cache
php artisan route:cache
php artisan view:cache

# PHP-FPM起動
php-fpm -D

# Nginx起動
nginx -g 'daemon off;'