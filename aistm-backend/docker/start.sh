#!/bin/bash
set -e

PORT_TO_LISTEN="${PORT:-8080}"
if [ -f /etc/nginx/sites-available/default ]; then
  sed -i "s/listen 8080;/listen ${PORT_TO_LISTEN};/" /etc/nginx/sites-available/default || true
fi

echo "[start] PORT=${PORT_TO_LISTEN}"

# マイグレーション（Railway等の本番でもスキーマ差分を反映）
echo "[start] running migrations..."
tries=0
until php artisan migrate --force; do
  tries=$((tries+1))
  if [ "$tries" -ge 10 ]; then
    echo "[start] migrate failed after ${tries} attempts"
    exit 1
  fi
  echo "[start] migrate failed; retrying (${tries}/10) ..."
  sleep 2
done

# マスタ初期データ投入（何度起動しても重複しないようSeeder側でfirstOrCreate）
echo "[start] seeding database..."
tries=0
until php artisan db:seed --force; do
  tries=$((tries+1))
  if [ "$tries" -ge 10 ]; then
    echo "[start] seed failed after ${tries} attempts"
    exit 1
  fi
  echo "[start] seed failed; retrying (${tries}/10) ..."
  sleep 2
done

# Laravelの初期化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Nginx設定テスト
echo "[start] nginx config test..."
nginx -t

# PHP-FPMをバックグラウンドで起動
php-fpm -F &

# Nginxをフォアグラウンドで起動
echo "[start] starting nginx..."
exec nginx -g "daemon off;"