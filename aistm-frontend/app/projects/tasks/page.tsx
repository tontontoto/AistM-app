"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type Task = {
    id: number;
    overview: string;
    project: {
        id: number;
        overview: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    status: {
        id: number;
        name: string;
    };
    priority: {
        id: number;
        name: string;
    };
    schedule: string | null;
    detail: string | null;
    related_url: string | null;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${apiBase}/tasks`);
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    // JSONでない場合は空配列として扱う
                    setTasks([]);
                    return;
                }

                if (!response.ok) {
                    // エラーの場合も空配列として扱う
                    setTasks([]);
                    return;
                }
                
                const data = await response.json().catch(() => []);
                setTasks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("タスク取得エラー:", err);
                // エラーが発生した場合は空配列として扱う
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [apiBase]);

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">タスク一覧</h1>
                <p className="text-gray-600">タスクを管理・確認できます</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">タスクがありません</p>
                    <p className="text-gray-400 text-sm mt-2">新しいタスクを作成してください</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <Link
                            key={task.id}
                            href={`/projects/tasks/${task.id}`}
                            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.overview}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">プロジェクト:</span>
                                            <span className="font-medium">{task.project?.overview || "未設定"}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">ステータス:</span>
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                {task.status?.name || "未設定"}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">優先度:</span>
                                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                {task.priority?.name || "未設定"}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">担当者:</span>
                                            <span className="font-medium">{task.user?.name || "未設定"}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-blue-600 ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
