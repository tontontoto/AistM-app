<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SendRegistrationEmailController extends Controller
{
    public function __invoke(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'メールアドレスの形式が正しくありません。',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $email = $validator->validated()['email'];

        try {
            // ユーザーが存在しない場合は作成
            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = User::create([
                    'username' => $email,
                    'email' => $email,
                    'password' => bcrypt(Str::random(32)),
                    'login_count' => 0,
                ]);
            }

            $fromAddress = config('mail.from.address');
            $fromName = config('mail.from.name');
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $setPasswordUrl = $frontendUrl . '/set-password?email=' . urlencode($email);

            Mail::raw(
                "【AistM】アカウント登録のご案内\n\n" .
                "この度は、AistMへのご登録ありがとうございます。\n\n" .
                "以下のリンクからパスワードを設定してください。\n\n" .
                $setPasswordUrl . "\n\n" .
                "このリンクは24時間有効です。\n\n" .
                "もし心当たりがない場合は、このメールを無視してください。\n\n" .
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                "AistM\n" .
                $fromAddress . "\n" .
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                function ($message) use ($email, $fromAddress, $fromName) {
                    $message->to($email)
                        ->from($fromAddress, $fromName)
                        ->subject('【AistM】アカウント登録のご案内');
                }
            );

            return response()->json([
                'message' => '登録メールを送信しました。',
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            \Log::error('メール送信エラー: ' . get_class($e) . ' ' . $e->getMessage());
            \Log::error('mail.mailer=' . config('mail.default') . ' from=' . config('mail.from.address') . ' to=' . $email);
            \Log::error('スタックトレース: ' . $e->getTraceAsString());

            $body = ['message' => 'メール送信に失敗しました。時間をおいて再度お試しください。'];
            if (config('app.debug')) {
                $body['debug'] = [
                    'type' => get_class($e),
                    'detail' => $e->getMessage(),
                ];
            }

            return response()->json($body, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
