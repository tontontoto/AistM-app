"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskCard from "./_components/taskCard";

type User = {
    id: number;
    username: string;
    name: string;
    email: string;
    login_count: number;
};

type Project = {
    id: number;
    overview: string;
    status: {
        name: string;
    };
};

type Task = {
    id: number;
    overview: string;
    project: {
        overview: string;
    };
    status: {
        name: string;
    };
};

// Cookieから値を取得する関数
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export default function ProfilePage() {
    const router = useRouter();
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

        const fetchData = async () => {
            try {
                const [userResponse, projectsResponse, tasksResponse] = await Promise.all([
                    fetch(`${apiBase}/users/${userId}`),
                    fetch(`${apiBase}/users/${userId}/projects`),
                    fetch(`${apiBase}/users/${userId}/tasks`),
                ]);

                // ユーザー情報の取得
                if (userResponse.ok) {
                    const contentType = userResponse.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const userData = await userResponse.json().catch(() => null);
                        if (userData) {
                            setUser(userData);
                        }
                    }
                } else if (userResponse.status === 404) {
                    setError("ユーザーが見つかりません");
                }

                // プロジェクトの取得
                if (projectsResponse.ok) {
                    const contentType = projectsResponse.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data = await projectsResponse.json().catch(() => []);
                        setProjects(Array.isArray(data) ? data : []);
                    }
                }

                // タスクの取得
                if (tasksResponse.ok) {
                    const contentType = tasksResponse.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data = await tasksResponse.json().catch(() => []);
                        setTasks(Array.isArray(data) ? data : []);
                    }
                }
            } catch (err) {
                console.error("データ取得エラー:", err);
                setError("データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiBase]);

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-semibold mb-2">エラー</p>
                    <p className="text-red-700 mb-4">{error || "ユーザー情報を取得できませんでした"}</p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        ログインページに戻る →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">ユーザープロフィール</h1>
                <p className="text-gray-600">あなたのプロジェクトとタスクを確認できます</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* プロフィール情報 */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sticky top-8">
                        <div className="flex flex-col items-center">
                            <Image
                                src="/icon.png"
                                alt="Profile"
                                width={120}
                                height={120}
                                className="rounded-full mb-4 border-4 border-gray-200"
                            />
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                {user.name || user.username || "ユーザー"}
                            </h3>
                            <div className="text-center space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    ログイン回数: {user.login_count || 0}回
                                </p>
                            </div>
                            <div className="w-full border-t border-gray-200 pt-4">
                                <button
                                    onClick={() => {
                                        document.cookie = "auth=; Path=/; Max-Age=0";
                                        document.cookie = "user_id=; Path=/; Max-Age=0";
                                        router.push("/login");
                                    }}
                                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    ログアウト
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* プロジェクトとタスク */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 在籍プロジェクト */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">在籍プロジェクト</h2>
                            <Link
                                href="/projects/addproject"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                + 新規作成
                            </Link>
                        </div>
                        {projects.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500 mb-2">プロジェクトがありません</p>
                                <Link
                                    href="/projects/addproject"
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                    新しいプロジェクトを作成する →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(0, 5).map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-800">{project.overview}</span>
                                            {project.status && (
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {project.status.name}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                                {projects.length > 5 && (
                                    <Link
                                        href="/projects"
                                        className="block text-center text-blue-600 hover:text-blue-800 hover:underline py-2"
                                    >
                                        すべてのプロジェクトを見る ({projects.length}件) →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 作業タスク */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">あなたの作業タスク</h2>
                            <Link
                                href="/projects/addtasks"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                + 新規作成
                            </Link>
                        </div>
                        {tasks.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500 mb-2">タスクがありません</p>
                                <Link
                                    href="/projects/addtasks"
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                    新しいタスクを作成する →
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                {tasks.slice(0, 5).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/projects/tasks/${task.id}`}
                                        className="block"
                                    >
                                        <TaskCard task_title={task.overview} task_id={task.id} />
                                    </Link>
                                ))}
                                {tasks.length > 5 && (
                                    <Link
                                        href="/projects/tasks"
                                        className="block text-center text-blue-600 hover:text-blue-800 hover:underline py-2"
                                    >
                                        すべてのタスクを見る ({tasks.length}件) →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
