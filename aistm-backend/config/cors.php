<?php

function cors_allowed_origins(): array
{
    $raw = env('CORS_ALLOWED_ORIGINS', '');
    $items = array_values(array_filter(array_map('trim', explode(',', $raw))));

    // ローカル開発用のデフォルト（環境変数が未設定の場合）
    return $items ?: ['http://localhost:3000'];
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => cors_allowed_origins(),
    'allowed_origins_patterns' => array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];