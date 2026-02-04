/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway向けの設定
  output: 'standalone', // SSRを使用する場合（Docker対応）
  
  images: {
    unoptimized: false, // standaloneモードでは画像最適化を有効化
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // トレーリングスラッシュ
  trailingSlash: true,

  // ベースパス（サブディレクトリにデプロイする場合）
  // basePath: '/my-app',
}

module.exports = nextConfig