"use client";

import React, { useEffect, useState, useMemo } from "react";

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
};

type Project = {
    id: number;
    overview: string;
    status: {
        id: number;
        name: string;
    };
    priority: {
        id: number;
        name: string;
    };
};

type Task = {
    id: number;
    overview: string;
    project: {
        id: number;
        overview: string;
    };
    status: {
        id: number;
        name: string;
    };
    priority: {
        id: number;
        name: string;
    };
};

type StatusCount = {
    企画中: number;
    進行中: number;
    完了: number;
    保留中: number;
};

// Cookieから値を取得する関数
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const userId = getCookie('user_id');

        if (!userId) {
            setError("ログインが必要です");
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // ユーザー情報、プロジェクト、タスクを並行して取得
                const [userRes, projectsRes, tasksRes] = await Promise.all([
                    fetch(`${apiBase}/users/${userId}`),
                    fetch(`${apiBase}/users/${userId}/projects`),
                    fetch(`${apiBase}/users/${userId}/tasks`),
                ]);

                if (!userRes.ok || !projectsRes.ok || !tasksRes.ok) {
                    throw new Error("データの取得に失敗しました");
                }

                const [userData, projectsData, tasksData] = await Promise.all([
                    userRes.json(),
                    projectsRes.json(),
                    tasksRes.json(),
                ]);

                setUser(userData);
                setProjects(projectsData);
                setTasks(tasksData);
            } catch (err) {
                console.error("ダッシュボードデータ取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [apiBase]);

    // ステータスごとのカウントを計算
    const projectCounts: StatusCount = useMemo(() => {
        const counts = { 企画中: 0, 進行中: 0, 完了: 0, 保留中: 0 };
        projects.forEach((project) => {
            const statusName = project.status?.name as keyof StatusCount;
            if (statusName in counts) {
                counts[statusName]++;
            }
        });
        return counts;
    }, [projects]);

    const taskCounts: StatusCount = useMemo(() => {
        const counts = { 企画中: 0, 進行中: 0, 完了: 0, 保留中: 0 };
        tasks.forEach((task) => {
            const statusName = task.status?.name as keyof StatusCount;
            if (statusName in counts) {
                counts[statusName]++;
            }
        });
        return counts;
    }, [tasks]);

    const statusCards = [
        { label: "企画中", color: "bg-purple-500", lightColor: "bg-purple-100 dark:bg-purple-900/30", textColor: "text-purple-800 dark:text-purple-100" },
        { label: "進行中", color: "bg-blue-500", lightColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-800 dark:text-blue-100" },
        { label: "完了", color: "bg-green-500", lightColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-800 dark:text-green-100" },
        { label: "保留中", color: "bg-gray-500", lightColor: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-800 dark:text-gray-100" },
    ];

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="text-gray-500">読み込み中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">エラー: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* ヘッダー部 */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">ダッシュボード</h1>
                <p className="text-base sm:text-lg text-gray-600">
                    ようこそ、<span className="font-semibold text-gray-800">{user?.name || "ユーザー"}</span> さん
                </p>
            </div>

            {/* プロジェクト セクション */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        プロジェクト
                    </div>
                    <span className="text-xs sm:text-sm font-normal text-gray-500">（合計: {projects.length}件）</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {statusCards.map((status) => (
                        <div
                            key={status.label}
                            className={`${status.lightColor} rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm`}
                        >
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <span className={`text-xs sm:text-sm font-medium ${status.textColor}`}>{status.label}</span>
                                <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${status.color}`}></span>
                            </div>
                            <p className={`text-2xl sm:text-4xl font-bold ${status.textColor}`}>
                                {projectCounts[status.label as keyof StatusCount]}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">件</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* タスク セクション */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        タスク
                    </div>
                    <span className="text-xs sm:text-sm font-normal text-gray-500">（合計: {tasks.length}件）</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {statusCards.map((status) => (
                        <div
                            key={status.label}
                            className={`${status.lightColor} rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm`}
                        >
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <span className={`text-xs sm:text-sm font-medium ${status.textColor}`}>{status.label}</span>
                                <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${status.color}`}></span>
                            </div>
                            <p className={`text-2xl sm:text-4xl font-bold ${status.textColor}`}>
                                {taskCounts[status.label as keyof StatusCount]}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">件</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
