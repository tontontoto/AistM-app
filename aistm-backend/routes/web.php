<?php

use App\Http\Controllers\Auth\GithubController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// GitHub認証関連のルート（ブラウザリダイレクトが必要なためwebルート）
Route::get('/api/auth/github', [GithubController::class, 'redirect']);
Route::get('/api/auth/github/callback', [GithubController::class, 'callback']);
