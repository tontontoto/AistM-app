<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * ユーザーIDからユーザー情報を取得
     */
    public function show(string $id)
    {
        $user = User::with(['skills'])
            ->select('id', 'username', 'name', 'email', 'login_count', 'avatar_color')
            ->findOrFail($id);

        return response()->json($user);
    }

    /**
     * ユーザーのスキルを更新
     */
    public function updateSkills(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'skills' => 'required|array',
            'skills.*' => 'string|max:100',
        ]);

        $skills = collect($validated['skills'])
            ->map(fn ($skill) => trim($skill))
            ->filter()
            ->unique();

        $skillIds = $skills->map(function ($name) {
            return Skill::firstOrCreate(['name' => $name])->id;
        })->values();

        $user->skills()->sync($skillIds);

        return response()->json([
            'message' => 'Skills updated',
            'skills' => $user->skills()->get(['id', 'name']),
        ]);
    }

    /**
     * ユーザー情報を更新
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'avatar_color' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'name' => 'sometimes|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'ユーザー情報を更新しました',
            'user' => $user,
        ]);
    }

    /**
     * ユーザーIDからプロジェクト一覧を取得
     */
    public function getProjects(string $id)
    {
        $projects = Project::with(['status', 'priority'])
            ->where(function ($query) use ($id) {
                $query->whereHas('users', function ($memberQuery) use ($id) {
                    $memberQuery->where('users.id', $id);
                })->orWhere('user_id', $id);
            })
            ->get();

        return response()->json($projects);
    }

    /**
     * ユーザーIDからタスク一覧を取得
     */
    public function getTasks(string $id)
    {
        $tasks = Task::with(['project', 'status', 'priority'])
            ->where('user_id', $id)
            ->get();

        return response()->json($tasks);
    }
}
