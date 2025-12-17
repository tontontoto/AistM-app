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
        Schema::table('projects', function (Blueprint $table) {
            // 既存のenumカラムを削除
            $table->dropColumn(['status', 'priority']);
        });

        Schema::table('projects', function (Blueprint $table) {
            // 外部キーカラムを追加
            $table->foreignId('status_id')->after('overview')->constrained('statuses');
            $table->foreignId('priority_id')->after('status_id')->constrained('priorities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // 外部キーを削除
            $table->dropForeign(['status_id']);
            $table->dropForeign(['priority_id']);
            $table->dropColumn(['status_id', 'priority_id']);
        });

        Schema::table('projects', function (Blueprint $table) {
            // enumカラムを復元
            $table->enum('status', ['planning', 'active', 'completed', 'on_hold'])->default('planning');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
        });
    }
};
