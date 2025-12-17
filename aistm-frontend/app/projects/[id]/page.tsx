"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
    created_at: string;
    updated_at: string;
};

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${apiBase}/projects/${projectId}`);
                const contentType = response.headers.get("content-type");
                
                if (!contentType || !contentType.includes("application/json")) {
                    setError("データの取得に失敗しました");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    setError(errorData?.message || "プロジェクトの取得に失敗しました");
                    return;
                }

                const data = await response.json().catch(() => {
                    setError("レスポンスの解析に失敗しました");
                });
                
                if (data) {
                    setProject(data);
                }
            } catch (err) {
                console.error("プロジェクト取得エラー:", err);
                setError("データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, apiBase]);

    if (loading) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-semibold mb-2">エラー</p>
                    <p className="text-red-700">{error}</p>
                    <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
                        ← プロジェクト一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="w-full">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">プロジェクトが見つかりません</p>
                    <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
                        ← プロジェクト一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href="/projects" className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block">
                    ← プロジェクト一覧に戻る
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">{project.overview}</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* ステータス */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">ステータス</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {project.status?.name || "未設定"}
                        </span>
                    </div>

                    {/* 優先度 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">優先度</p>
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                            {project.priority?.name || "未設定"}
                        </span>
                    </div>

                    {/* 担当者 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">担当者</p>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{project.user?.name || "未設定"}</span>
                            {project.user?.email && (
                                <span className="text-sm text-gray-500">{project.user.email}</span>
                            )}
                        </div>
                    </div>

                    {/* 期限 */}
                    {project.schedule && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">期限</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(project.schedule).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    )}
                </div>

                {/* 説明 */}
                {project.detail && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">説明</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{project.detail}</p>
                        </div>
                    </div>
                )}

                {/* 関連リンク */}
                {project.related_url && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">関連リンク</p>
                        <a 
                            href={project.related_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                            {project.related_url}
                        </a>
                    </div>
                )}

                {/* メタ情報 */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>作成日時: {new Date(project.created_at).toLocaleString('ja-JP')}</span>
                        <span>最終更新: {new Date(project.updated_at).toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
