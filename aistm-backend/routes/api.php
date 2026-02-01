<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\CheckEmailController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MasterDataController;
use Illuminate\Support\Facades\Route;

Route::post('/signup', RegisterController::class);
Route::get('/email/check', CheckEmailController::class);
Route::post('/login', LoginController::class);
Route::post('/email/send-registration', \App\Http\Controllers\Auth\SendRegistrationEmailController::class);
Route::post('/set-password', \App\Http\Controllers\Auth\SetPasswordController::class);

// ユーザー関連のルート
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/users/{id}/projects', [UserController::class, 'getProjects']);
Route::get('/users/{id}/tasks', [UserController::class, 'getTasks']);

// プロジェクト関連のルート
Route::apiResource('projects', ProjectController::class);

// タスク関連のルート
Route::apiResource('tasks', TaskController::class);

// マスターデータ関連のルート
Route::get('/master/statuses', [MasterDataController::class, 'getStatuses']);
Route::get('/master/priorities', [MasterDataController::class, 'getPriorities']);
Route::get('/master/users', [MasterDataController::class, 'getUsers']);
Route::get('/master/projects', [MasterDataController::class, 'getProjects']);
Route::get('/master/all', [MasterDataController::class, 'getAll']);
