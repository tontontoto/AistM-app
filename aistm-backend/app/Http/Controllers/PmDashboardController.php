<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PmDashboardController extends Controller
{
    private const HELP_REASONS = [
        'technical_unknown',
        'spec_unknown',
        'insufficient_time',
    ];

    /**
     * PM向けチーム・ヘルス・ダッシュボード
     */
    public function index(Request $request)
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

        $userId = (int) $request->input('user_id');

        $inProgressStatusId = Status::where('name', '進行中')->value('id');

        $projects = Project::with([
            'users.skills',
            'skills',
            'status',
            'priority',
            'tasks' => function ($query) use ($inProgressStatusId) {
                if ($inProgressStatusId) {
                    $query->where('status_id', $inProgressStatusId);
                }
                $query->whereNotNull('schedule');
            },
        ])
            ->where('created_by', $userId)
            ->get();

        $projectIds = $projects->pluck('id')->all();
        $notifications = Notification::whereIn('project_id', $projectIds)
            ->whereIn('reason', self::HELP_REASONS)
            ->get();

        $notificationsByTask = $notifications->groupBy('task_id');
        $notificationsByProject = $notifications->groupBy('project_id');

        $now = Carbon::now();
        $projectSummaries = [];
        $totalSos = 0;
        $totalStalled = 0;

        foreach ($projects as $project) {
            $projectNotifications = $notificationsByProject->get($project->id, collect());
            $sosCount = $projectNotifications->whereNull('resolved_at')->count();
            $totalSos += $sosCount;

            $requiredSkills = $project->skills->map(fn ($skill) => $skill->name)->values();
            $memberSkills = $project->users
                ->flatMap(fn ($user) => $user->skills->map(fn ($skill) => $skill->name))
                ->unique()
                ->values();

            $coveredSkills = $requiredSkills->filter(fn ($name) => $memberSkills->contains($name));
            $missingSkills = $requiredSkills->reject(fn ($name) => $memberSkills->contains($name))->values();

            $requiredCount = $requiredSkills->count();
            $coveredCount = $coveredSkills->count();
            $coverage = $requiredCount === 0 ? 1 : $coveredCount / $requiredCount;

            $stalledTasks = [];
            foreach ($project->tasks as $task) {
                if (!$task->schedule) {
                    continue;
                }

                $createdAt = Carbon::parse($task->created_at);
                $schedule = Carbon::parse($task->schedule);

                if ($schedule->lessThanOrEqualTo($createdAt)) {
                    continue;
                }

                $halfwaySeconds = $createdAt->diffInSeconds($schedule) / 2;
                $halfwayAt = $createdAt->copy()->addSeconds($halfwaySeconds);

                if ($now->lessThan($halfwayAt)) {
                    continue;
                }

                $taskNotifications = $notificationsByTask->get($task->id, collect());
                $latestHelpAt = $taskNotifications->max('created_at');

                $shouldFlag = $taskNotifications->isEmpty();
                if (!$shouldFlag && $latestHelpAt) {
                    $latestHelpAt = Carbon::parse($latestHelpAt);
                    $shouldFlag = $latestHelpAt->lessThanOrEqualTo($halfwayAt);
                }

                if ($shouldFlag) {
                    $stalledTasks[] = [
                        'id' => $task->id,
                        'overview' => $task->overview,
                        'schedule' => $task->schedule,
                        'created_at' => $task->created_at,
                        'halfway_at' => $halfwayAt->toDateTimeString(),
                        'last_help_at' => $latestHelpAt ? $latestHelpAt->toDateTimeString() : null,
                    ];
                }
            }

            $totalStalled += count($stalledTasks);

            $projectSummaries[] = [
                'id' => $project->id,
                'overview' => $project->overview,
                'status' => $project->status,
                'priority' => $project->priority,
                'members_count' => $project->users->count(),
                'skills_required' => $requiredSkills,
                'skill_coverage' => [
                    'total_required' => $requiredCount,
                    'covered' => $coveredCount,
                    'percent' => round($coverage * 100, 1),
                    'missing' => $missingSkills,
                ],
                'sos_count' => $sosCount,
                'stalled_tasks' => $stalledTasks,
            ];
        }

        return response()->json([
            'projects' => $projectSummaries,
            'totals' => [
                'sos_count' => $totalSos,
                'stalled_tasks_count' => $totalStalled,
            ],
        ]);
    }

    /**
     * PM向けSOS(Help)一覧を取得（通知とは別枠）
     */
    public function sosIndex(Request $request)
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

        $userId = (int) $request->input('user_id');

        $projectIds = Project::where('created_by', $userId)->pluck('id')->all();

        $sosNotifications = Notification::with(['sender', 'project', 'task'])
            ->whereIn('project_id', $projectIds)
            ->whereIn('reason', self::HELP_REASONS)
            ->whereNull('resolved_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'items' => $sosNotifications,
        ]);
    }

    /**
     * SOS(Help)を解決済みにする（未解決カウントから除外）
     */
    public function resolveSos(Request $request, string $id)
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

        $userId = (int) $request->input('user_id');

        $notification = Notification::with(['project'])->findOrFail($id);

        if (!$notification->project_id || !$notification->project) {
            return response()->json([
                'message' => 'Project not found for this SOS',
            ], 422);
        }

        if (!in_array($notification->reason, self::HELP_REASONS, true)) {
            return response()->json([
                'message' => 'Not a SOS notification',
            ], 422);
        }

        if ((int) $notification->project->created_by !== $userId) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        if ($notification->resolved_at) {
            return response()->json([
                'message' => 'Already resolved',
                'notification' => $notification,
            ]);
        }

        $notification->resolved_at = now();
        $notification->save();

        return response()->json([
            'message' => 'SOS resolved',
            'notification' => $notification->load(['sender', 'project', 'task']),
        ]);
    }
}
