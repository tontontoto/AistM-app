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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
                    {/* ヘッダー */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">アカウント登録</h1>
                        <p className="text-sm sm:text-base text-gray-600">新しいアカウントを作成します</p>
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
