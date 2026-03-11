"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { maskEmail } from "@/utils/maskEmail";

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
    is_completed: number;
    created_at: string;
    updated_at: string;
};

type Props = {
    selectedId?: string | number | null;
};

const helpReasons = [
    { value: "technical_unknown", label: "技術的に不明" },
    { value: "spec_unknown", label: "仕様が不明" },
    { value: "insufficient_time", label: "工数が足りない" },
];

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function TaskDetails({ selectedId }: Props) {
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [updatingCompletion, setUpdatingCompletion] = useState(false);
    const [showHelpReasons, setShowHelpReasons] = useState(false);
    const [sendingHelp, setSendingHelp] = useState(false);
    const [confirmHelp, setConfirmHelp] = useState<{
        open: boolean;
        label: string;
        value: string;
    }>({
        open: false,
        label: "",
        value: "",
    });

    const apiBase = useMemo(() => {
        const base =
            process.env.NEXT_PUBLIC_API_URL || "/api";
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
                    setError(
                        errorData?.message || "タスクの取得に失敗しました",
                    );
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

    const handleToggleCompletion = async () => {
        if (!task || !selectedId || updatingCompletion) return;

        const newCompletionStatus = task.is_completed === 1 ? 0 : 1;
        setUpdatingCompletion(true);

        try {
            const response = await fetch(`${apiBase}/tasks/${selectedId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    ...task,
                    is_completed: newCompletionStatus,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.message || "完了状態の更新に失敗しました");
                return;
            }

            // タスク情報を更新
            setTask((prev) =>
                prev ? { ...prev, is_completed: newCompletionStatus } : null,
            );
        } catch (err) {
            console.error("完了状態更新エラー:", err);
            setError("完了状態の更新に失敗しました");
        } finally {
            setUpdatingCompletion(false);
        }
    };

    const handleDelete = async () => {
        if (!task || !selectedId) return;

        setDeleting(true);
        try {
            const response = await fetch(`${apiBase}/tasks/${selectedId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.message || "タスクの削除に失敗しました");
                setShowDeleteConfirm(false);
                return;
            }

            // 削除成功後、タスク一覧ページにリダイレクト
            router.push("/projects/tasks");
        } catch (err) {
            console.error("タスク削除エラー:", err);
            setError("タスクの削除に失敗しました");
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleSendHelp = async (reason: string) => {
        if (!task || sendingHelp) return;
        const userId = getCookie("user_id");
        if (!userId) {
            setError("ログインが必要です");
            return;
        }

        setSendingHelp(true);
        try {
            const response = await fetch(`${apiBase}/tasks/${task.id}/help`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender_id: Number(userId),
                    reason,
                }),
            });

            if (!response.ok) {
                setError("通知の送信に失敗しました");
                return;
            }

            setShowHelpReasons(false);
        } catch (err) {
            console.error("通知送信エラー:", err);
            setError("通知の送信に失敗しました");
        } finally {
            setSendingHelp(false);
        }
    };

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
                <div className="mb-4">
                    <Link
                        href="/projects/tasks"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
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
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            ></path>
                        </svg>
                        タスク一覧に戻る
                    </Link>
                </div>
                <p className="text-sm text-gray-500 mb-2">タスクの詳細情報</p>
                <div className="flex items-center justify-between">
                    <h2
                        className={`text-2xl font-bold transition-all ${task.is_completed === 1 ? "text-gray-400 line-through" : "text-gray-800"}`}
                    >
                        {task.overview}
                    </h2>
                    {/* iOS風チェックボックス */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowHelpReasons((prev) => !prev)}
                            className="px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                            PMに通知
                        </button>
                        <span
                            className={`text-sm font-medium ${task.is_completed === 1 ? "text-green-600" : "text-gray-600"}`}
                        >
                            {task.is_completed === 1 ? "完了" : "未完了"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={task.is_completed === 1}
                                onChange={handleToggleCompletion}
                                disabled={updatingCompletion}
                                className="sr-only peer"
                            />
                            {/* iOS風スイッチ */}
                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:bg-green-500 shadow-inner"></div>
                        </label>
                    </div>
                </div>
                {showHelpReasons && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-2">
                            何に困っていますか？
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {helpReasons.map((reason) => (
                                <button
                                    key={reason.value}
                                    type="button"
                                    onClick={() =>
                                        setConfirmHelp({
                                            open: true,
                                            label: reason.label,
                                            value: reason.value,
                                        })
                                    }
                                    disabled={sendingHelp}
                                    className="px-2 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {confirmHelp.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            送信しますか？
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            「{task.overview}」について「{confirmHelp.label}
                            」でPMに通知します。
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfirmHelp({
                                        open: false,
                                        label: "",
                                        value: "",
                                    })
                                }
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleSendHelp(confirmHelp.value);
                                    setConfirmHelp({
                                        open: false,
                                        label: "",
                                        value: "",
                                    });
                                }}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                送信
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 基本情報 */}
            <div className="relative">
                {/* 編集ボタン - 右上 */}
                <div className="absolute top-0 right-0">
                    <Link
                        href={`/projects/tasks/${task.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            ></path>
                        </svg>
                        編集
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 完了状態 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">完了状態</p>
                        <div className="flex items-center gap-2">
                            {task.is_completed === 1 ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    完了
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    未完了
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 親プロジェクト */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">
                            親プロジェクト
                        </p>
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
                            <span className="font-semibold text-gray-800">
                                {task.user?.name || "未設定"}
                            </span>
                            {task.user?.email && (
                                <span className="text-sm text-gray-500">
                                    {maskEmail(task.user.email)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 期限 */}
                    {task.schedule && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">期限</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(task.schedule).toLocaleDateString(
                                    "ja-JP",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    },
                                )}
                            </p>
                        </div>
                    )}

                    {/* 作成日時 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">作成日時</p>
                        <p className="text-sm text-gray-700">
                            {new Date(task.created_at).toLocaleString("ja-JP")}
                        </p>
                    </div>
                </div>
            </div>

            {/* 説明 */}
            {task.detail && (
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        説明
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {task.detail}
                        </p>
                    </div>
                </div>
            )}

            {/* 関連リンク */}
            {task.related_url && (
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        関連リンク
                    </p>
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

            {/* 更新日時と削除ボタン */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-400">
                        最終更新:{" "}
                        {new Date(task.updated_at).toLocaleString("ja-JP")}
                    </p>

                    {/* 削除ボタン - 左下 */}
                    <div className="flex items-center gap-2 mt-2">
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    削除しますか？
                                </span>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? "削除中..." : "削除"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    キャンセル
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                削除
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
