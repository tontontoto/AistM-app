<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with(['user', 'status', 'priority'])->get();
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
            'user_id' => 'required|exists:users,id',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::create($request->all());

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load(['user', 'status', 'priority'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $project = Project::with(['user', 'status', 'priority'])->findOrFail($id);
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
            'user_id' => 'sometimes|required|exists:users,id',
            'schedule' => 'nullable|date',
            'related_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->all());

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load(['user', 'status', 'priority'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }
}
