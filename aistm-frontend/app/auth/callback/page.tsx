"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const userId = searchParams.get('user_id');
        const email = searchParams.get('email');
        const error = searchParams.get('error');

        if (error) {
            router.push(`/login?error=${encodeURIComponent(error)}`);
            return;
        }

        if (userId && email) {
            // 認証状態とユーザーIDをCookieにセット
            document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
            document.cookie = `user_id=${userId}; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
            router.push("/projects");
        } else {
            router.push("/login?error=" + encodeURIComponent("認証に失敗しました"));
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-gray-600">認証処理中...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}

