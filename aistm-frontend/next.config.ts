/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway向けの設定
  output: 'standalone', // Dockerデプロイに必須
  
  images: {
    unoptimized: false, // 画像最適化を有効化
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // トレーリングスラッシュ
  trailingSlash: false,
}

module.exports = nextConfig