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
        Schema::create('identity_providers', function (Blueprint $table) {
            // reference the users.id (unsigned big integer)
            $table->unsignedBigInteger('user_id')->comment('ユーザID');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->string('provider_name')->comment('プロバイダー名');
            $table->string('provider_user_id')->comment('プロバイダーユーザID');

            // composite primary key on provider_name + provider_user_id
            $table->primary(['provider_name', 'provider_user_id']);

            // ensure one provider per user is unique
            $table->unique(['user_id', 'provider_name']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identity_providers');
    }
};
