<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    // SNS認証画面へリダイレクト
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    // コールバック処理
    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            // ユーザーを検索または作成
            $user = User::updateOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'username' => $socialUser->getName() ?? $socialUser->getNickname() ?? $socialUser->getEmail(),
                    'email' => $socialUser->getEmail(),
                    'password' => bcrypt(str()->random(24)),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]
            );

            // ログイン
            Auth::login($user, true);

            // 最終ログイン日時を更新
            $user->last_login_at = now();
            $user->save();

            // ログ出力（デバッグ用）
            Log::info('User logged in via ' . $provider, ['user_id' => $user->id, 'email' => $user->email]);

            // フロントエンドにリダイレクト
            return redirect('http://localhost:3000');

        } catch (\Exception $e) {
            Log::error('Social auth error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=auth_failed');
        }
    }
}