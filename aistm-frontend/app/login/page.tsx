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
    // Railway等の本番環境で env 未設定だと localhost を向いて通信不能になるため、同一オリジンの /api をデフォルトにする
    const base = process.env.NEXT_PUBLIC_API_URL || "/api";
    return base.replace(/\/+$/, "");
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
      router.push("/projects");
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{" "}
              <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                新規登録
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
