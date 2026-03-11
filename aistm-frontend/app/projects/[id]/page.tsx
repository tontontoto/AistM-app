"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { maskEmail } from "@/utils/maskEmail";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

type Project = {
    id: number;
    overview: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    users?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    status: {
        id: number;
        name: string;
    };
    priority: {
        id: number;
        name: string;
    };
    creator?: {
        id: number;
        name?: string;
        email?: string;
    };
    schedule: string | null;
    detail: string | null;
    related_url: string | null;
    created_at: string;
    updated_at: string;
};

export default function ProjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params?.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const currentUserId = Number(getCookie("user_id"));
    const isCreator = project?.creator?.id === currentUserId;

    const apiBase = useMemo(() => {
        const base =
            process.env.NEXT_PUBLIC_API_URL || "/api";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${apiBase}/projects/${projectId}`,
                );
                const contentType = response.headers.get("content-type");

                if (!contentType || !contentType.includes("application/json")) {
                    setError("データの取得に失敗しました");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    setError(
                        errorData?.message ||
                            "プロジェクトの取得に失敗しました",
                    );
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

    const handleDelete = async () => {
        if (!project || !projectId) return;

        const userId = getCookie("user_id");
        if (!userId) {
            setError("ログインが必要です");
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${apiBase}/projects/${projectId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: Number(userId) }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                setError(
                    errorData?.message || "プロジェクトの削除に失敗しました",
                );
                setShowDeleteConfirm(false);
                return;
            }

            // 削除成功後、プロジェクト一覧ページにリダイレクト
            router.push("/projects");
        } catch (err) {
            console.error("プロジェクト削除エラー:", err);
            setError("プロジェクトの削除に失敗しました");
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

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
                    <Link
                        href="/projects"
                        className="text-blue-600 hover:underline mt-4 inline-block"
                    >
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
                    <p className="text-gray-500 text-lg">
                        プロジェクトが見つかりません
                    </p>
                    <Link
                        href="/projects"
                        className="text-blue-600 hover:underline mt-4 inline-block"
                    >
                        ← プロジェクト一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* ヘッダー部 */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {project.overview}
                    </h1>
                </div>
                <Link
                    href={`/projects/${project.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="編集"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* ステータス */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">ステータス</p>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                project.status?.name === "企画中"
                                    ? "bg-purple-100 text-purple-800"
                                    : project.status?.name === "進行中"
                                      ? "bg-blue-100 text-blue-800"
                                      : project.status?.name === "完了"
                                        ? "bg-green-100 text-green-800"
                                        : project.status?.name === "保留中"
                                          ? "bg-gray-200 text-gray-800"
                                          : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {project.status?.name || "未設定"}
                        </span>
                    </div>

                    {/* 優先度 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">優先度</p>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                project.priority?.name === "高"
                                    ? "bg-red-100 text-red-800"
                                    : project.priority?.name === "中"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : project.priority?.name === "低"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {project.priority?.name || "未設定"}
                        </span>
                    </div>

                    {/* 担当者 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">担当者</p>
                        {project.users && project.users.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {project.users.map((user) => (
                                    <span
                                        key={user.id}
                                        className="inline-flex flex-col bg-white border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <span className="font-semibold text-gray-800 text-sm">
                                            {user.name || "名前なし"}
                                        </span>
                                        {user.email && (
                                            <span className="text-xs text-gray-500">
                                                {maskEmail(user.email)}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">
                                    {project.user?.name || "未設定"}
                                </span>
                                {project.user?.email && (
                                    <span className="text-sm text-gray-500">
                                        {maskEmail(project.user.email)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 期限 */}
                    {project.schedule && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">期限</p>
                            <p className="font-semibold text-gray-800">
                                {(() => {
                                    const scheduleStr = String(
                                        project.schedule,
                                    );
                                    const match = scheduleStr.match(
                                        /(\d{4})-(\d{2})-(\d{2})/,
                                    );
                                    if (match) {
                                        return `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
                                    }
                                    return scheduleStr;
                                })()}
                            </p>
                        </div>
                    )}
                </div>

                {/* 説明 */}
                {project.detail && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            説明
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {project.detail}
                            </p>
                        </div>
                    </div>
                )}

                {/* 関連リンク */}
                {project.related_url && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            関連リンク
                        </p>
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

                {/* メタ情報と削除ボタン */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            <span>
                                作成日時:{" "}
                                {new Date(project.created_at).toLocaleString(
                                    "ja-JP",
                                )}
                            </span>
                            <span>
                                最終更新:{" "}
                                {new Date(project.updated_at).toLocaleString(
                                    "ja-JP",
                                )}
                            </span>
                        </div>

                        {/* 削除ボタン - 左下 */}
                        {isCreator && (
                            <div className="flex items-center gap-2 mt-2">
                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            削除しますか？
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            関連通知も削除されます
                                        </span>
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleting ? "削除中..." : "削除"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowDeleteConfirm(false)
                                            }
                                            disabled={deleting}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() =>
                                            setShowDeleteConfirm(true)
                                        }
                                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                    >
                                        削除
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
