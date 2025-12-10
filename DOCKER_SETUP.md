# Docker セットアップガイド

## 前提条件
- Docker Desktop がインストールされていること
- Docker Compose がインストールされていること

## セットアップ手順

### 1. 環境変数ファイルを作成

プロジェクトルートに `.env` ファイルを作成してください：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、データベースの認証情報を設定してください。

### 2. Docker コンテナをビルド・起動

```bash
# イメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d
```

### 3. バックエンド（Laravel）のセットアップ

```bash
# マイグレーションを実行
docker exec aistm-backend_fpm php artisan migrate
```

### 4. アクセス確認

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8080
- MySQL: localhost:3306

## サービス構成

| サービス | コンテナ名 | ポート |
|---------|-----------|--------|
| MySQL | aistm-mysql | 3306 |
| Laravel (PHP-FPM) | aistm-backend_fpm | 9000 |
| Nginx | aistm-backend_nginx | 8080 |
| Next.js | aistm-frontend | 3000 |

## よく使うコマンド

```bash
# コンテナの状態確認
docker-compose ps

# ログ確認
docker-compose logs -f

# 特定のサービスのログを確認
docker-compose logs -f backend
docker-compose logs -f frontend

# コンテナ内でコマンド実行
docker exec aistm-backend_fpm php artisan [command]

# コンテナを停止
docker-compose down

# コンテナとボリュームを削除
docker-compose down -v
```

## トラブルシューティング

### ポートが既に使用されている場合

`docker-compose.yml` のポート番号を変更してください：

```yaml
ports:
  - "8080:80"  # 左側の数字を変更（例: 8081:80）
```

### データベース接続エラー

1. MySQL が起動しているか確認
2. `.env` ファイルの設定を確認
3. `aistm-backend/.env` のDB設定を確認
