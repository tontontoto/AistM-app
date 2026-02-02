"use client";


import React, { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../(components)/input";
import Button from "../(components)/button";

// メールアドレスの正規表現
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function page() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "sending" | "sent">("idle");
    const [emailSent, setEmailSent] = useState(false);

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

    const checkEmailAvailability = useCallback(
        async (targetEmail: string) => {
            if (!emailRegex.test(targetEmail)) {
                setEmailStatus("idle");
                return null;
            }

            setError(null);
            setEmailStatus("checking");
            try {
                const response = await fetch(
                    `${apiBase}/email/check?email=${encodeURIComponent(targetEmail)}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    const message = data?.message || "メール確認に失敗しました。";
                    setError(message);
                    setEmailStatus("idle");
                    return null;
                }

                const data = await response.json();
                const available = Boolean(data?.available);
                setEmailStatus(available ? "available" : "unavailable");
                if (!available) {
                    setError("このメールアドレスは既に登録されています。");
                }
                return available;
            } catch (err) {
                setError("メール確認に失敗しました。時間をおいて再度お試しください。");
                setEmailStatus("idle");
                return null;
            }
        },
        [apiBase]
    );

    const sendRegistrationEmail = useCallback(
        async (targetEmail: string) => {
            if (!emailRegex.test(targetEmail)) {
                return false;
            }

            setError(null);
            setEmailStatus("sending");
            try {
                const response = await fetch(`${apiBase}/email/send-registration`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ email: targetEmail }),
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    const message = data?.message || "メール送信に失敗しました。";
                    setError(message);
                    setEmailStatus("available");
                    return false;
                }

                // レスポンスが成功した場合
                setEmailStatus("sent");
                setEmailSent(true);
                return true;
            } catch (err) {
                setError("メール送信に失敗しました。時間をおいて再度お試しください。");
                setEmailStatus("available");
                return false;
            }
        },
        [apiBase]
    );

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!emailRegex.test(email)) {
            setError("メールアドレスの形式が正しくありません。");
            return;
        }

        if (password.length < 8) {
            setError("パスワードは8文字以上で入力してください。");
            return;
        }

        const availability = await checkEmailAvailability(email);
        if (availability === false) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message = data?.message || "登録に失敗しました。";
                const detail = data?.errors
                    ? Object.values(data.errors as Record<string, string[]>).
                        flat().
                        join(" ")
                    : "";
                setError([message, detail].filter(Boolean).join(" "));
                return;
            }

            router.push("/");
        } catch (err) {
            setError("通信に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 sm:py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
                    {/* ヘッダー */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">アカウント登録</h1>
                        <p className="text-sm sm:text-base text-gray-600">新しいアカウントを作成します</p>
                    </div>

                    {/* ソーシャルログインボタン */}
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        {/* Google認証ボタン */}
                        <a
                            href="#"
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 shadow-sm text-sm sm:text-base"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Googleで登録・ログイン</span>
                        </a>

                        {/* GitHub認証ボタン */}
                        <a
                            href={githubAuthUrl}
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm text-sm sm:text-base"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span>GitHubで登録・ログイン</span>
                        </a>
                    </div>

                    {/* 区切り線 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">または</span>
                        </div>
                    </div>

                    {/* メール/パスワードフォーム */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            input_title=""
                            input_id="email"
                            input_type="email"
                            input_pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailStatus("idle");
                                setError(null);
                                setEmailSent(false);
                            }}
                            required
                            placeholder="メールアドレス"
                            onBlur={async () => {
                                const availability = await checkEmailAvailability(email);
                                if (availability === true && !emailSent) {
                                    await sendRegistrationEmail(email);
                                }
                            }}
                            className="border-2 border-gray-300 rounded-lg p-2 w-full"
                        />
                        
                        {/* ステータスメッセージ */}
                        {emailStatus === "checking" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-blue-700 text-sm">メールアドレスを確認中です...</p>
                            </div>
                        )}
                        {emailStatus === "sending" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-blue-700 text-sm">登録用メールを送信中です...</p>
                            </div>
                        )}
                        {emailStatus === "sent" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <p className="text-green-700 text-sm">登録用メールを送信しました。メールボックスをご確認ください。</p>
                            </div>
                        )}
                        {emailStatus === "available" && !emailSent && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <p className="text-green-700 text-sm">このメールアドレスは使用できます。</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        
                        {/* 登録ボタン */}
                        <Button
                            button_type="submit"
                            button_title={loading ? "登録中..." : "アカウントを登録"}
                            disabled={
                                loading ||
                                emailStatus === "checking" ||
                                emailStatus === "unavailable"
                            }
                        />
                    </form>

                    {/* ログインリンク */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            既にアカウントをお持ちですか？{" "}
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                ログイン
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
