<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = Task::with(['project', 'user', 'status', 'priority'])->get();
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'overview' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'status_id' => 'required|exists:statuses,id',
            'priority_id' => 'required|exists:priorities,id',
            'detail' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'start_date' => 'nullable|date',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $task = Task::create($request->all());

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['project', 'user', 'status', 'priority'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $task = Task::with(['project', 'user', 'status', 'priority'])->findOrFail($id);
        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'overview' => 'sometimes|required|string|max:255',
            'project_id' => 'sometimes|required|exists:projects,id',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'priority_id' => 'sometimes|required|exists:priorities,id',
            'detail' => 'nullable|string',
            'user_id' => 'sometimes|required|exists:users,id',
            'start_date' => 'nullable|date',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
            'is_completed' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $task->update($request->all());

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load(['project', 'user', 'status', 'priority'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }
}
