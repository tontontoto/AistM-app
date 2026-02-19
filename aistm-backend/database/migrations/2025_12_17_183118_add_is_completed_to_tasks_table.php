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
        if (!Schema::hasColumn('tasks', 'is_completed')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->tinyInteger('is_completed')->default(0)->after('related_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tasks', 'is_completed')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('is_completed');
            });
        }
    }
};
