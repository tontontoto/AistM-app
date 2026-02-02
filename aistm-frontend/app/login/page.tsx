"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../(components)/input";
import Button from "../(components)/button";

export default function page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiBase = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
    return base.replace(/\/+$/, "");
  }, []);

  const githubAuthUrl = useMemo(() => {
    // APIベースURLから/apiを削除して、GitHub認証エンドポイントを追加
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
    const cleanBase = base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    return `${cleanBase}/api/auth/github`;
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.message || "ログインに失敗しました。";
        setError(message);
        return;
      }

      const data = await response.json();
      
      // 認証状態とユーザーIDをCookieにセット（簡易）
      document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
      if (data.user?.id) {
        document.cookie = `user_id=${data.user.id}; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
      }
      router.push("/");
    } catch (err) {
      setError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">ログイン</h1>
            <p className="text-sm sm:text-base text-gray-600">アカウントにログインしてください</p>
          </div>

          {/* GitHubログインボタン */}
          <div className="mb-4 sm:mb-6">
            <a
              href={githubAuthUrl}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHubでログイン
            </a>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              input_title="メールアドレス"
              input_id="email"
              input_type="email"
              input_pattern=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              input_title="パスワード"
              input_id="password"
              input_type="password"
              input_pattern=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <Button
              button_type="submit"
              button_title={loading ? "ログイン中..." : "ログイン"}
              disabled={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
