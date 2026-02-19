<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\CheckEmailController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PmDashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/signup', RegisterController::class);
Route::get('/email/check', CheckEmailController::class);
Route::post('/login', LoginController::class);
Route::post('/email/send-registration', \App\Http\Controllers\Auth\SendRegistrationEmailController::class);
Route::post('/set-password', \App\Http\Controllers\Auth\SetPasswordController::class);

// ユーザー関連のルート
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::get('/users/{id}/projects', [UserController::class, 'getProjects']);
Route::get('/users/{id}/tasks', [UserController::class, 'getTasks']);
Route::get('/users/{id}/notifications', [NotificationController::class, 'index']);
Route::put('/users/{id}/skills', [UserController::class, 'updateSkills']);

// プロジェクト関連のルート
Route::apiResource('projects', ProjectController::class);
Route::put('/projects/{id}/skills', [ProjectController::class, 'updateSkills']);

// タスク関連のルート
Route::apiResource('tasks', TaskController::class);
Route::post('/tasks/{id}/help', [NotificationController::class, 'storeTaskHelp']);

// 通知関連のルート
Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);

// PM向けダッシュボード
Route::get('/pm-dashboard', [PmDashboardController::class, 'index']);
Route::get('/pm-dashboard/sos', [PmDashboardController::class, 'sosIndex']);
Route::put('/pm-dashboard/sos/{id}/resolve', [PmDashboardController::class, 'resolveSos']);

// マスターデータ関連のルート
Route::get('/master/statuses', [MasterDataController::class, 'getStatuses']);
Route::get('/master/priorities', [MasterDataController::class, 'getPriorities']);
Route::get('/master/users', [MasterDataController::class, 'getUsers']);
Route::get('/master/projects', [MasterDataController::class, 'getProjects']);
Route::get('/master/all', [MasterDataController::class, 'getAll']);
