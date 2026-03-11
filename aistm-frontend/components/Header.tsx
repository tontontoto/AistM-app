"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { maskEmail } from "@/utils/maskEmail";

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

type Notification = {
    id: number;
    sender?: {
        id: number;
        name?: string;
        username?: string;
        email?: string;
    };
    project?: {
        id: number;
        overview?: string;
    };
    task?: {
        id: number;
        overview?: string;
    };
    reason: string;
    read_at: string | null;
    created_at: string;
};

const reasonLabels: Record<string, string> = {
    technical_unknown: "技術的に不明",
    spec_unknown: "仕様が不明",
    insufficient_time: "工数が足りない",
};

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [avatarColor, setAvatarColor] = useState<string | undefined>(undefined);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

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

    const fetchNotifications = async (userId: string, showLoading = true) => {
        if (showLoading) {
            setLoadingNotifications(true);
        }
        try {
            const response = await fetch(`${apiBase}/users/${userId}/notifications`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                setNotifications([]);
                return;
            }
            if (!response.ok) {
                setNotifications([]);
                return;
            }
            const data = await response.json().catch(() => []);
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("通知取得エラー:", err);
            setNotifications([]);
        } finally {
            if (showLoading) {
                setLoadingNotifications(false);
            }
        }
    };

    const handleToggleNotifications = () => {
        const userId = getCookie("user_id");
        if (!userId) return;
        const nextOpen = !notificationsOpen;
        setNotificationsOpen(nextOpen);
        if (nextOpen) {
            fetchNotifications(userId, true);
        }
    };

    useEffect(() => {
        const userId = getCookie("user_id");
        if (!isLoggedIn || !userId) {
            setNotifications([]);
            return;
        }

        fetchNotifications(userId, false);
        const intervalId = window.setInterval(() => {
            fetchNotifications(userId, false);
        }, 15000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [apiBase, isLoggedIn]);

    const handleMarkRead = async (notificationId: number) => {
        const userId = getCookie("user_id");
        if (!userId) return;
        try {
            const response = await fetch(`${apiBase}/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: Number(userId) }),
            });
            if (!response.ok) return;
            setNotifications(prev => prev.map(item =>
                item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
            ));
        } catch (err) {
            console.error("通知更新エラー:", err);
        }
    };

    const unreadCount = notifications.filter(item => !item.read_at).length;

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
                
                <div className="flex items-center gap-3">
                    {isLoggedIn && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleToggleNotifications}
                                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="通知"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">通知</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {loadingNotifications ? (
                                            <div className="px-4 py-6 text-sm text-gray-500">読み込み中...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-sm text-gray-500">通知はありません</div>
                                        ) : (
                                            notifications.map(item => (
                                                <div key={item.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="text-sm text-gray-700">
                                                            <p className="font-semibold text-gray-800">
                                                                {item.project?.overview || "プロジェクト"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.task?.overview || "タスク"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                送信者: {item.sender?.name || item.sender?.username || (item.sender?.email ? maskEmail(item.sender.email) : "不明")}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-600">
                                                                理由: {reasonLabels[item.reason] || item.reason}
                                                            </p>
                                                        </div>
                                                        {!item.read_at && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMarkRead(item.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                            >
                                                                既読
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
