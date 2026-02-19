FROM php:8.4-fpm

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    nginx \
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

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .

RUN composer dump-autoload --optimize --no-dev

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache \
    && mkdir -p storage/framework/{sessions,views,cache} storage/logs

# Nginx設定とスタートスクリプトをコピー
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]