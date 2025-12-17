<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class CheckEmailController extends Controller
{
    public function __invoke(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'メールアドレスが正しくありません。',
                'errors' => $validator->errors(),
                'available' => false,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $email = $validator->validated()['email'];
        $exists = User::where('email', $email)->exists();

        return response()->json([
            'available' => !$exists,
        ]);
    }
}
