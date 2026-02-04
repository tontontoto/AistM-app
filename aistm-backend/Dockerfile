FROM php:8.4-fpm

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP拡張機能のインストール
RUN docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install pdo_mysql exif pcntl gd zip opcache

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Composer依存関係（キャッシュ最適化）
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# アプリケーションコード
COPY . .

# オートロード最適化
RUN composer dump-autoload --optimize --no-dev

# パーミッション設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache \
    && mkdir -p storage/framework/{sessions,views,cache} storage/logs

EXPOSE 8000

CMD php artisan optimize && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=8000