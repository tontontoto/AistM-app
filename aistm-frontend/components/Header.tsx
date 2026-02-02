"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

type User = {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    avatar_color?: string;
};

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [avatarColor, setAvatarColor] = useState<string | undefined>(undefined);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const auth = getCookie("auth");
        const userId = getCookie("user_id");
        setIsLoggedIn(auth === "1");

        if (auth === "1" && userId) {
            // ユーザー情報を取得
            fetch(`${apiBase}/users/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUser(data);
                    if (data?.avatar_color) {
                        setAvatarColor(data.avatar_color);
                    }
                })
                .catch(err => console.error("ユーザー情報取得エラー:", err));

            // ローカル保存済みの色があれば即時反映
            const savedColor = localStorage.getItem(`avatar_color_${userId}`);
            if (savedColor) {
                setAvatarColor(savedColor);
            }
        }

        const handleAvatarColorUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<{ userId: string; color: string }>;
            if (!customEvent.detail) return;
            const { userId: updatedUserId, color } = customEvent.detail;
            const currentUserId = getCookie("user_id");
            if (updatedUserId && currentUserId === updatedUserId) {
                setAvatarColor(color);
            }
        };

        const handleStorage = (event: StorageEvent) => {
            const currentUserId = getCookie("user_id");
            if (!currentUserId) return;
            if (event.key === `avatar_color_${currentUserId}` && event.newValue) {
                setAvatarColor(event.newValue || undefined);
            }
        };

        window.addEventListener("avatarColorUpdated", handleAvatarColorUpdate as EventListener);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("avatarColorUpdated", handleAvatarColorUpdate as EventListener);
            window.removeEventListener("storage", handleStorage);
        };
    }, [apiBase]);

    const logoHref = isLoggedIn ? "/projects" : "/";

    return (
        <header className="w-full py-4 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-row justify-between w-full items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href={logoHref} className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        AistM
                    </Link>
                    <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400 font-medium">
                        作業管理ツール
                    </span>
                </div>
                
                <div>
                    <Link href="/user/profile">
                        <UserAvatar
                            name={user?.name}
                            username={user?.username}
                            email={user?.email}
                            avatarColor={avatarColor ?? user?.avatar_color}
                            size="sm"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
}
