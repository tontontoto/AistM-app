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

      // 認証状態のCookieをセット（簡易）
      document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
      router.push("/");
    } catch (err) {
      setError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-amber-50 w-[80%] items-center mx-auto">
        <h2>ログインページ</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            input_title="メールアドレス"
            input_id="email"
            input_type="email"
            input_pattern=""
            value={email}
            onChange={setEmail}
            required
          />
          <Input
            input_title="パスワード"
            input_id="password"
            input_type="password"
            input_pattern=""
            value={password}
            onChange={setPassword}
            required
          />
          {error && <p className="text-red-600">{error}</p>}
          <Button
            button_type="submit"
            button_title={loading ? "ログイン中..." : "ログイン"}
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}
