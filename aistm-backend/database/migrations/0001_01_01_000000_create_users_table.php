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
        Schema::create('users', function (Blueprint $table) {
            $table->id();                                    // ユーザーID
            $table->string('name')->nullable()->comment('氏名');
            $table->string('username')->nullable()->comment('ユーザー名');
            $table->string('email')->unique()->comment('メールアドレス');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->comment('パスワード');
            // last login timestamp
            $table->timestamp('last_login_at')->nullable()->comment('最終ログイン日時');
            // optional link to a task (nullable)
            $table->unsignedBigInteger('task_id')->nullable()->comment('関連タスクID');
            $table->string('provider')->nullable()->comment('SNSプロバイダー（google, github等）');
            $table->string('provider_id')->nullable()->comment('SNSプロバイダーのユーザーID');
            $table->rememberToken();
            $table->timestamps();
            // indexes
            $table->index('task_id');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
