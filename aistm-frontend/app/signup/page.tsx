"use client";


import React, { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../(components)/input";
import Button from "../(components)/button";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function page() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");

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
        <div className="w-[1100px]  items-center mx-auto">
            <h2 className="font-bold text-3xl">アカウント登録</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    input_title="メールアドレス"
                    input_id="email"
                    input_type="email"
                    input_pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    value={email}
                    onChange={(val) => {
                        setEmail(val);
                        setEmailStatus("idle");
                        setError(null);
                    }}
                    required
                    placeholder="example@mail.com"
                    onBlur={() => void checkEmailAvailability(email)}
                />
                <Input
                    input_title="パスワード"
                    input_id="password"
                    input_type="password"
                    input_pattern=""
                    value={password}
                    onChange={setPassword}
                    required
                    placeholder="8文字以上"
                />
                {emailStatus === "checking" && (
                    <p className="text-gray-600">メールアドレスを確認中です...</p>
                )}
                {emailStatus === "available" && (
                    <p className="text-green-700">このメールアドレスは使用できます。</p>
                )}
                {error && <p className="text-red-600">{error}</p>}
                <Button
                    button_type="submit"
                    button_title={loading ? "登録中..." : "登録"}
                    disabled={
                        loading ||
                        emailStatus === "checking" ||
                        emailStatus === "unavailable"
                    }
                />
            </form>
        </div>
    );
}
