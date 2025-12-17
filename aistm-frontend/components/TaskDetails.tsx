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
    created_at: string;
    updated_at: string;
};

type Props = {
    selectedId?: string | number | null;
};

export default function TaskDetails({ selectedId }: Props) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        if (!selectedId) {
            setTask(null);
            return;
        }

        const fetchTask = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${apiBase}/tasks/${selectedId}`);
                const contentType = response.headers.get("content-type");
                
                if (!contentType || !contentType.includes("application/json")) {
                    setError("データの取得に失敗しました");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    setError(errorData?.message || "タスクの取得に失敗しました");
                    return;
                }

                const data = await response.json().catch(() => {
                    setError("レスポンスの解析に失敗しました");
                });
                
                if (data) {
                    setTask(data);
                }
            } catch (err) {
                console.error("タスク取得エラー:", err);
                setError("データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [selectedId, apiBase]);

    if (!selectedId) {
        return (
            <div className="p-10 flex flex-col gap-4 border border-gray-300 rounded-3xl bg-white shadow-sm">
                <p className="text-sm text-gray-500">タスクの詳細情報</p>
                <div className="text-center text-gray-400 py-8">
                    <p>タスクを選択してください</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-10 flex flex-col gap-4 border border-gray-300 rounded-3xl bg-white shadow-sm">
                <p className="text-sm text-gray-500">タスクの詳細情報</p>
                <div className="text-center text-gray-400 py-8">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 flex flex-col gap-4 border border-red-300 rounded-3xl bg-red-50 shadow-sm">
                <p className="text-sm text-red-500">エラー</p>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-10 flex flex-col gap-4 border border-gray-300 rounded-3xl bg-white shadow-sm">
                <p className="text-sm text-gray-500">タスクの詳細情報</p>
                <div className="text-center text-gray-400 py-8">
                    <p>タスクが見つかりません</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 flex flex-col gap-6 border border-gray-300 rounded-3xl bg-white shadow-lg">
            {/* ヘッダー */}
            <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-2">タスクの詳細情報</p>
                <h2 className="text-2xl font-bold text-gray-800">{task.overview}</h2>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 親プロジェクト */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">親プロジェクト</p>
                    <Link 
                        href={`/projects/${task.project.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                    >
                        {task.project?.overview || "未設定"}
                    </Link>
                </div>

                {/* ステータス */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ステータス</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {task.status?.name || "未設定"}
                    </span>
                </div>

                {/* 優先度 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">優先度</p>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                        {task.priority?.name || "未設定"}
                    </span>
                </div>

                {/* 担当者 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">担当者</p>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{task.user?.name || "未設定"}</span>
                        {task.user?.email && (
                            <span className="text-sm text-gray-500">{task.user.email}</span>
                        )}
                    </div>
                </div>

                {/* 期限 */}
                {task.schedule && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">期限</p>
                        <p className="font-semibold text-gray-800">
                            {new Date(task.schedule).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                )}

                {/* 作成日時 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">作成日時</p>
                    <p className="text-sm text-gray-700">
                        {new Date(task.created_at).toLocaleString('ja-JP')}
                    </p>
                </div>
            </div>

            {/* 説明 */}
            {task.detail && (
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">説明</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{task.detail}</p>
                    </div>
                </div>
            )}

            {/* 関連リンク */}
            {task.related_url && (
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">関連リンク</p>
                    <a 
                        href={task.related_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                        {task.related_url}
                    </a>
                </div>
            )}

            {/* 更新日時 */}
            <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-400">
                    最終更新: {new Date(task.updated_at).toLocaleString('ja-JP')}
                </p>
            </div>
        </div>
    );
}
