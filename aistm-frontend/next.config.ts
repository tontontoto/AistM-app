/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify向けの設定
  output: 'export', // 静的エクスポート（SSRなしの場合）
  // または
  // output: 'standalone', // SSRを使用する場合
  
  images: {
    unoptimized: true, // 静的エクスポートの場合は必須
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