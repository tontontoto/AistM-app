<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Notification;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with(['users', 'status', 'priority', 'creator', 'user', 'skills'])->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'overview' => 'required|string|max:255',
            'status_id' => 'required|exists:statuses,id',
            'priority_id' => 'required|exists:priorities,id',
            'detail' => 'nullable|string',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
            'created_by' => 'required|exists:users,id',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $memberIds = array_values(array_unique(array_map('intval', $request->input('user_ids', []))));
        $creatorId = (int) $request->input('created_by');

        if (!in_array($creatorId, $memberIds, true)) {
            $memberIds[] = $creatorId;
        }

        $primaryUserId = $memberIds[0] ?? $creatorId;

        $project = Project::create([
            'overview' => $request->input('overview'),
            'status_id' => $request->input('status_id'),
            'priority_id' => $request->input('priority_id'),
            'detail' => $request->input('detail'),
            'user_id' => $primaryUserId,
            'created_by' => $creatorId,
            'schedule' => $request->input('schedule'),
            'related_url' => $request->input('related_url'),
        ]);

        $project->users()->sync($memberIds);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load(['users', 'status', 'priority', 'creator', 'user', 'skills'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $project = Project::with(['users', 'status', 'priority', 'creator', 'user', 'skills'])->findOrFail($id);
        return response()->json($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $project = Project::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'overview' => 'sometimes|required|string|max:255',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'priority_id' => 'sometimes|required|exists:priorities,id',
            'detail' => 'nullable|string',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
            'user_ids' => 'sometimes|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update([
            'overview' => $request->input('overview', $project->overview),
            'status_id' => $request->input('status_id', $project->status_id),
            'priority_id' => $request->input('priority_id', $project->priority_id),
            'detail' => $request->input('detail', $project->detail),
            'schedule' => $request->input('schedule', $project->schedule),
            'related_url' => $request->input('related_url', $project->related_url),
        ]);

        if ($request->has('user_ids')) {
            $memberIds = array_values(array_unique(array_map('intval', $request->input('user_ids', []))));
            $project->users()->sync($memberIds);

            if (!empty($memberIds)) {
                $project->user_id = $memberIds[0];
                $project->save();
            }
        }

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load(['users', 'status', 'priority', 'creator', 'user', 'skills'])
        ]);
    }

    /**
     * プロジェクトの必要スキルを更新
     */
    public function updateSkills(Request $request, string $id)
    {
        $project = Project::findOrFail($id);

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

        $project->skills()->sync($skillIds);

        return response()->json([
            'message' => 'Project skills updated',
            'skills' => $project->skills()->get(['id', 'name']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $project = Project::with('tasks')->findOrFail($id);

        $validator = Validator::make(request()->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ((int) $project->created_by !== (int) request()->input('user_id')) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $taskIds = $project->tasks->pluck('id')->all();

        Notification::where('project_id', $project->id)
            ->orWhereIn('task_id', $taskIds)
            ->delete();

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }
}
