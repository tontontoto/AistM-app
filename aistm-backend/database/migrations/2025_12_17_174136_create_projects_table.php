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
        Schema::create('projects', function (Blueprint $table) {
            $table->id(); // プロジェクトID
            $table->string('overview'); // プロジェクト概要
            $table->enum('status', ['planning', 'active', 'completed', 'on_hold'])->default('planning'); // プロジェクトステータス
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium'); // プロジェクト優先度
            $table->text('detail')->nullable(); // プロジェクトの詳細
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 担当者
            $table->date('schedule')->nullable(); // 日程
            $table->string('related_url')->nullable(); // 関連URL
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
