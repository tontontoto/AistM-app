<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * 通知一覧を取得
     */
    public function index(string $userId)
    {
        $notifications = Notification::with(['sender', 'project', 'task'])
            ->where('recipient_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($notifications);
    }

    /**
     * タスクのヘルプ通知を作成
     */
    public function storeTaskHelp(Request $request, string $taskId)
    {
        $validator = Validator::make($request->all(), [
            'sender_id' => 'required|exists:users,id',
            'reason' => 'required|in:technical_unknown,spec_unknown,insufficient_time',
            'message' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $task = Task::with(['project.creator'])->findOrFail($taskId);
        $creator = $task->project?->creator;

        if (!$creator) {
            return response()->json([
                'message' => 'Project leader not found',
            ], 422);
        }

        $notification = Notification::create([
            'sender_id' => $request->input('sender_id'),
            'recipient_id' => $creator->id,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'reason' => $request->input('reason'),
            'message' => $request->input('message'),
            'read_at' => null,
        ]);

        return response()->json([
            'message' => 'Help request sent',
            'notification' => $notification->load(['sender', 'project', 'task']),
        ], 201);
    }

    /**
     * 通知を既読にする
     */
    public function markRead(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $notification = Notification::findOrFail($id);

        if ((int) $notification->recipient_id !== (int) $request->input('user_id')) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $notification->read_at = now();
        $notification->save();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
    }
}
