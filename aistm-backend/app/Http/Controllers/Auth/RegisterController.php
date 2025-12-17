<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    public function __invoke(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => '登録内容に不備があります。',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $validator->validated();

        $user = User::create([
            'username' => $validated['email'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'login_count' => 1,
        ]);

        return response()->json([
            'message' => 'ユーザー登録が完了しました。',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ], Response::HTTP_CREATED);
    }
}
