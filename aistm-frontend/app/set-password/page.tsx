"use client";

import React, { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "../(components)/input";
import Button from "../(components)/button";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    // URLパラメータからメールアドレスを取得
    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam && emailRegex.test(emailParam)) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // バリデーション
        if (!email || !emailRegex.test(email)) {
            setError("メールアドレスが正しくありません。");
            return;
        }

        if (!password || password.length < 8) {
            setError("パスワードは8文字以上で入力してください。");
            return;
        }

        if (password !== confirmPassword) {
            setError("パスワードが一致しません。");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/set-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message = data?.message || "パスワード設定に失敗しました。";
                const detail = data?.errors
                    ? Object.values(data.errors as Record<string, string[]>)
                          .flat()
                          .join(" ")
                    : "";
                setError([message, detail].filter(Boolean).join(" "));
                return;
            }

            const data = await response.json();
            
            // 認証状態とユーザーIDをCookieにセット（自動ログイン）
            document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
            if (data.user?.id) {
                document.cookie = `user_id=${data.user.id}; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
            }

            setSuccess(true);
            // 2秒後にプロジェクト一覧ページにリダイレクト
            setTimeout(() => {
                router.push("/projects");
            }, 2000);
        } catch (err) {
            setError("通信に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                    {/* ヘッダー */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">パスワード設定</h1>
                        <p className="text-gray-600">アカウント登録を完了するためにパスワードを設定してください</p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-3">
                                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-green-700 font-medium">パスワード設定が完了しました！</p>
                                <p className="text-green-600 text-sm">プロジェクト一覧ページにリダイレクトします...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* メールアドレス入力 */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレス
                                </label>
                                <Input
                                    input_title=""
                                    input_id="email"
                                    input_type="email"
                                    input_pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    placeholder="example@mail.com"
                                    className="border-2 border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>

                            {/* パスワード入力 */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    パスワード
                                </label>
                                <Input
                                    input_title=""
                                    input_id="password"
                                    input_type="password"
                                    input_pattern=""
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    placeholder="8文字以上"
                                    className="border-2 border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>

                            {/* パスワード確認入力 */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    パスワード（確認）
                                </label>
                                <Input
                                    input_title=""
                                    input_id="confirmPassword"
                                    input_type="password"
                                    input_pattern=""
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    placeholder="パスワードを再入力"
                                    className="border-2 border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>

                            {/* エラーメッセージ */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                                    <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* 送信ボタン */}
                            <Button
                                button_type="submit"
                                button_title={loading ? "設定中..." : "パスワードを設定"}
                                disabled={loading || !email || !password || !confirmPassword}
                            />
                        </form>
                    )}
                    
                    {/* ログインリンク */}
                    {!success && !loading && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                既にアカウントをお持ちですか？{" "}
                                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    ログイン
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
