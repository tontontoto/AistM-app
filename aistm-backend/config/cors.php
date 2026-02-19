<?php

$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '')))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins ?: ['http://localhost:3000'],
    'allowed_origins_patterns' => array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];