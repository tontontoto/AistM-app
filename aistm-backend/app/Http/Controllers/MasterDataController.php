<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\Priority;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    /**
     * ステータス一覧を取得
     */
    public function getStatuses()
    {
        $statuses = Status::all();
        return response()->json($statuses);
    }

    /**
     * 優先度一覧を取得
     */
    public function getPriorities()
    {
        $priorities = Priority::all();
        return response()->json($priorities);
    }

    /**
     * ユーザー一覧を取得
     */
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'username', 'avatar_color')->get();
        return response()->json($users);
    }

    /**
     * すべてのマスターデータを一括取得
     */
    public function getAll()
    {
        return response()->json([
            'statuses' => Status::all(),
            'priorities' => Priority::all(),
            'users' => User::select('id', 'name', 'email', 'username', 'avatar_color')->get(),
        ]);
    }

    /**
     * プロジェクト一覧を取得（タスク作成時の親プロジェクト選択用）
     */
    public function getProjects()
    {
        $projects = Project::select('id', 'overview')->get();
        return response()->json($projects);
    }
}
