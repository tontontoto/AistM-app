"use client";

import React, { FormEvent, useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "../(components)/input";
import Button from "../(components)/button";

export const dynamic = "force-dynamic";

// メールアドレスの正規表現
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function SetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!emailRegex.test(email)) {
            setError("メールアドレスの形式が正しくありません。");
            return;
        }

        if (!name.trim()) {
            setError("入力してください。");
            return;
        }

        if (password.length < 8) {
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
                body: JSON.stringify({ email, name, password }),
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
            setSuccess(true);
            // ユーザー情報をCookieにセットして自動ログイン
            if (data.user?.id) {
                document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
                document.cookie = `user_id=${data.user.id}; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
            }
            // 2秒後にプロジェクト一覧ページにリダイレクト
            setTimeout(() => {
                router.push("/projects");
            }, 2000);
        } catch (err) {
            setError("エラーが発生しました。時間をおいて再度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">ユーザー情報登録</h1>
                        <p className="text-sm sm:text-base text-gray-600">お名前とパスワードを設定してください</p>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-gray-800 mb-2">ユーザー情報の登録が完了しました</p>
                            <p className="text-gray-600">プロジェクト一覧ページにリダイレクトします...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    input_title="メールアドレス"
                                    input_id="email"
                                    input_type="email"
                                    input_pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    placeholder="メールアドレス"
                                    className="border-2 border-gray-300 rounded-lg p-2 w-full"
                                    disabled
                                />

                                <Input
                                    input_title="お名前"
                                    input_id="name"
                                    input_type="text"
                                    input_pattern=""
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    placeholder="お名前を入力"
                                    className="border-2 border-gray-300 rounded-lg p-2 w-full"
                                />

                                <Input
                                    input_title="パスワード"
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

                                <Input
                                    input_title="パスワード（確認）"
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

                                <Button
                                    button_type="submit"
                                    button_title={loading ? "登録中..." : "登録する"}
                                    disabled={loading}
                                />
                            </form>

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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <div className="text-center">
                            <p className="text-gray-600">読み込み中...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <SetPasswordContent />
        </Suspense>
    );
}
