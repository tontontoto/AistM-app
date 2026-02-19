"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import TaskDetails from "@/components/TaskDetails";
import Button from "@/app/(components)/button";

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

export default function TasksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const raw = params?.taskId;
    const selectedId = Array.isArray(raw) ? raw[0] : raw;
    
    // 編集ページかどうかを判定
    const isEditPage = pathname?.includes('/edit');

    const [fullTasks, setFullTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'status' | 'priority' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${apiBase}/tasks`);
                const contentType = response.headers.get("content-type");
                if (response.ok && contentType && contentType.includes("application/json")) {
                    const data = await response.json().catch(() => []);
                    const tasksArray = Array.isArray(data) ? data : [];
                    setFullTasks(tasksArray);
                } else {
                    // エラーまたはJSONでない場合は空配列
                    setFullTasks([]);
                }
            } catch (err) {
                console.error("タスク取得エラー:", err);
                // エラーが発生した場合は空配列
                setFullTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [apiBase]);

    // ソート機能
    const sortedTasks = useMemo(() => {
        if (!sortBy) return fullTasks;

        const sorted = [...fullTasks].sort((a, b) => {
            let aValue: string;
            let bValue: string;

            if (sortBy === 'status') {
                aValue = a.status?.name || '';
                bValue = b.status?.name || '';
            } else if (sortBy === 'priority') {
                aValue = a.priority?.name || '';
                bValue = b.priority?.name || '';
            } else {
                return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [fullTasks, sortBy, sortOrder]);

    const handleSort = (field: 'status' | 'priority') => {
        if (sortBy === field) {
            // 同じフィールドの場合は並び順を切り替え
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // 新しいフィールドの場合は昇順でソート
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="min-h-screen">
            <main className="w-full mx-auto px-4 py-6">
                <div className="w-full">
                    {isEditPage ? (
                        // 編集ページの場合はchildrenをそのまま表示
                        children
                    ) : selectedId ? (
                        // タスクが選択されている場合は詳細を表示
                        <TaskDetails selectedId={selectedId} />
                    ) : (
                        // タスクが選択されていない場合はリストを表示
                        <div className="w-full">
                            <div className="mb-6 flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">タスク一覧</h1>
                                    <p className="text-gray-600">タスクを管理・確認できます</p>
                                </div>
                                <div className="flex justify-end">
                                    <Link href="/projects/addtasks" className="text-blue-600 hover:text-blue-800">
                                        <Button button_type="button" button_title="タスク新規作成" color="blue" />
                                    </Link>
                                </div>
                            </div>

                            {/* ソート機能 */}
                            {!loading && fullTasks.length > 0 && (
                                <div className="mb-6 flex items-center gap-4 flex-wrap">
                                    <span className="text-sm font-medium text-gray-700">並び替え:</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            ステータス
                                            {sortBy === 'status' && (
                                                <span className="ml-2">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleSort('priority')}
                                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            優先度
                                            {sortBy === 'priority' && (
                                                <span className="ml-2">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </button>
                                        {sortBy && (
                                            <button
                                                onClick={() => {
                                                    setSortBy(null);
                                                    setSortOrder('asc');
                                                }}
                                                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                リセット
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500">読み込み中...</div>
                                </div>
                            ) : fullTasks.length === 0 ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                    <p className="text-gray-500 text-lg">タスクがありません</p>
                                    <p className="text-gray-400 text-sm mt-2">新しいタスクを作成してください</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sortedTasks.map((task) => (
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
                    )}
                </div>
            </main>
        </div>
    );
}
