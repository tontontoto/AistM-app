<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id(); // タスクID
            $table->string('overview'); // タスク概要
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade'); // 親プロジェクト
            $table->foreignId('status_id')->constrained('statuses'); // ステータス
            $table->foreignId('priority_id')->constrained('priorities'); // 優先度
            $table->text('detail')->nullable(); // タスクの詳細
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // 担当者
            $table->date('schedule')->nullable(); // 期限
            $table->string('related_url')->nullable(); // 関連URL
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
