"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TaskCard from "./_components/taskCard";

type Project = {
    id: number;
    overview: string;
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

export default function page() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    const handleStatusChange = async (projectId: number, statusId: number, statusName: string) => {
        const response = await fetch(`${apiBase}/projects/${projectId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status_id: statusId }),
        });

        if (!response.ok) {
            throw new Error("ステータスの更新に失敗しました");
        }

        // ローカルの状態も更新
        setProjects(prev => prev.map(p => 
            p.id === projectId 
                ? { ...p, status: { ...p.status, id: statusId, name: statusName } }
                : p
        ));
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${apiBase}/projects`);
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("サーバーからのレスポンスがJSON形式ではありません。APIサーバーが起動しているか確認してください。");
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || "プロジェクトの取得に失敗しました");
                }
                
                const data = await response.json().catch(() => {
                    throw new Error("レスポンスの解析に失敗しました");
                });
                setProjects(data);
            } catch (err) {
                console.error("プロジェクト取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [apiBase]);

    return(
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">プロジェクト一覧</h1>
                    <p className="text-gray-600">プロジェクトを管理・確認できます</p>
                </div>
                <Link
                    href="/projects/addproject"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    新規作成
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">エラー: {error}</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">プロジェクトがありません</p>
                    <p className="text-gray-400 text-sm mt-2">新しいプロジェクトを作成してください</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <TaskCard 
                            key={project.id} 
                            task={{
                                id: project.id,
                                title: project.overview,
                                assignee: project.user?.name || "未設定",
                                status: project.status?.name || "未設定",
                                statusId: project.status?.id || 1,
                                priority: project.priority?.name || "未設定",
                            }}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
