<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// GitHub認証関連のルート（ブラウザリダイレクトが必要なためwebルート）
Route::get('/api/auth/github', [AuthController::class, 'redirectToGitHub']);
Route::get('/api/auth/github/callback', [AuthController::class, 'handleGitHubCallback']);
