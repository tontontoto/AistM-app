<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        Schema::create('project_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['project_id', 'user_id']);
        });

        $projects = DB::table('projects')->select('id', 'user_id')->get();
        $now = now();

        foreach ($projects as $project) {
            if ($project->user_id) {
                DB::table('project_user')->insertOrIgnore([
                    'project_id' => $project->id,
                    'user_id' => $project->user_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('projects')
                ->where('id', $project->id)
                ->update(['created_by' => $project->user_id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_user');

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });
    }
};
