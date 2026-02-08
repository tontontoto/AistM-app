<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * GitHub認証へのリダイレクト
     */
    public function redirectToGitHub()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * GitHub認証のコールバック処理
     */
    public function handleGitHubCallback(Request $request)
    {
        try {
            $githubUser = Socialite::driver('github')->user();

            // GitHub IDで既存ユーザーを検索
            $user = User::where('github_id', $githubUser->getId())->first();

            if (!$user) {
                // メールアドレスで既存ユーザーを検索
                $user = User::where('email', $githubUser->getEmail())->first();

                if ($user) {
                    // 既存ユーザーにGitHub IDを紐付け
                    $user->update([
                        'github_id' => $githubUser->getId(),
                        'avatar_url' => $githubUser->getAvatar(),
                    ]);
                } else {
                    // 新規ユーザーを作成
                    $user = User::create([
                        'username' => $githubUser->getNickname() ?? $githubUser->getName() ?? Str::random(10),
                        'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                        'email' => $githubUser->getEmail(),
                        'github_id' => $githubUser->getId(),
                        'avatar_url' => $githubUser->getAvatar(),
                        'password' => bcrypt(Str::random(32)),
                        'login_count' => 1,
                    ]);
                }
            } else {
                // ログイン回数をインクリメント
                $user->increment('login_count');
                // アバターURLを更新
                $user->update([
                    'avatar_url' => $githubUser->getAvatar(),
                ]);
            }

            // フロントエンドにリダイレクトするためのURLを返す
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/auth/callback?user_id=' . $user->id . '&email=' . urlencode($user->email);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            \Log::error('GitHub認証エラー: ' . $e->getMessage());

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?error=' . urlencode('GitHub認証に失敗しました'));
        }
    }
}
