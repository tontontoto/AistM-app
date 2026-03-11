"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import UserAvatar from "../../../components/UserAvatar";
import { maskEmail } from "@/utils/maskEmail";

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    login_count: number;
    avatar_color?: string;
    created_at?: string;
    updated_at?: string;
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => {
        const base =
            process.env.NEXT_PUBLIC_API_URL || "/api";
        return base.replace(/\/+$/, "");
    }, []);

    // ユーザー一覧を取得
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${apiBase}/master/users`);

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error(
                        "サーバーからのレスポンスがJSON形式ではありません。APIサーバーが起動しているか確認してください。",
                    );
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(
                        errorData?.message || "ユーザーの取得に失敗しました",
                    );
                }

                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
                setFilteredUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("ユーザー取得エラー:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "データの読み込みに失敗しました",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [apiBase]);

    // 検索フィルター
    useEffect(() => {
        let results = users;

        // 名前で検索
        if (searchName.trim()) {
            results = results.filter(
                (user) =>
                    user.name
                        ?.toLowerCase()
                        .includes(searchName.toLowerCase()) ||
                    user.username
                        ?.toLowerCase()
                        .includes(searchName.toLowerCase()),
            );
        }

        // メールアドレスで検索
        if (searchEmail.trim()) {
            results = results.filter((user) =>
                user.email?.toLowerCase().includes(searchEmail.toLowerCase()),
            );
        }

        setFilteredUsers(results);
    }, [searchName, searchEmail, users]);

    // 検索クリア
    const handleClearSearch = () => {
        setSearchName("");
        setSearchEmail("");
    };

    return (
        <div className="w-full">
            {/* ヘッダー */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    ユーザー管理
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    登録されているユーザーを検索・確認できます
                </p>
            </div>

            {/* 検索フォーム */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        検索フィルター
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 名前検索 */}
                    <div>
                        <label
                            htmlFor="searchName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            名前・ユーザー名
                        </label>
                        <input
                            type="text"
                            id="searchName"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="名前で検索..."
                            className="w-full px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                    </div>

                    {/* メールアドレス検索 */}
                    <div>
                        <label
                            htmlFor="searchEmail"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            メールアドレス
                        </label>
                        <input
                            type="text"
                            id="searchEmail"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="メールアドレスで検索..."
                            className="w-full px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* クリアボタン */}
                {(searchName || searchEmail) && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleClearSearch}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            検索クリア
                        </button>
                    </div>
                )}
            </div>

            {/* ローディング */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <svg
                            className="animate-spin h-8 w-8 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="text-gray-500">読み込み中...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-start gap-2">
                        <svg
                            className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <p className="text-red-700 text-sm sm:text-base">
                            {error}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* 検索結果数 */}
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm sm:text-base text-gray-600">
                            {filteredUsers.length === users.length ? (
                                <span>
                                    全{" "}
                                    <span className="font-semibold text-gray-800">
                                        {users.length}
                                    </span>{" "}
                                    件のユーザー
                                </span>
                            ) : (
                                <span>
                                    <span className="font-semibold text-gray-800">
                                        {filteredUsers.length}
                                    </span>{" "}
                                    件が見つかりました
                                    <span className="text-gray-500 ml-2">
                                        （全 {users.length} 件中）
                                    </span>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* ユーザー一覧 */}
                    {filteredUsers.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            <p className="text-gray-500 text-lg mb-2">
                                該当するユーザーが見つかりませんでした
                            </p>
                            <p className="text-gray-400 text-sm">
                                検索条件を変更してください
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                name={user.name}
                                                username={user.username}
                                                email={user.email}
                                                avatarColor={user.avatar_color}
                                                size="md"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                                                    {user.name ||
                                                        user.username ||
                                                        "名前なし"}
                                                </h3>
                                                {user.username &&
                                                    user.name &&
                                                    user.username !==
                                                        user.name && (
                                                        <p className="text-xs text-gray-500">
                                                            @{user.username}
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg
                                                className="w-4 h-4 flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="truncate">
                                                {maskEmail(user.email)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg
                                                className="w-4 h-4 flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>
                                                ログイン回数:{" "}
                                                {user.login_count || 0}回
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <Link
                                            href={`/user/${user.id}`}
                                            className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            詳細を見る
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
