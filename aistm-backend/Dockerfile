# aistm-backend/Dockerfile

# PHP-FPMのベースイメージを使用
FROM php:8.2-fpm

# 必要なシステムパッケージとPHP拡張機能をインストール
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# GD（画像処理）などのPHP拡張機能をインストール
RUN docker-php-ext-install pdo_mysql exif pcntl gd

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリの設定
WORKDIR /var/www/html

# 既存のLaravelプロジェクトをコピー
# ★プロジェクトが空の場合、後でdocker-composeのvolumesでマウントされます
COPY . /var/www/html/

# 権限の設定（開発環境向け）
RUN chown -R www-data:www-data /var/www/html

# PHP-FPMのデフォルトポート9000を公開
EXPOSE 9000