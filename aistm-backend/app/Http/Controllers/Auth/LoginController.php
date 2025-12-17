<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function __invoke(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => '入力内容に不備があります。',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = $validator->validated();
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user->increment('login_count');

        return response()->json([
            'message' => 'ログイン成功',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'login_count' => $user->login_count,
            ],
            'authenticated' => true,
        ], Response::HTTP_OK);
    }
}
