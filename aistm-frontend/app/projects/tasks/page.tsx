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

type HelpMenuState = {
    task: Task | null;
    x: number;
    y: number;
    show: boolean;
    showReasons: boolean;
};

type ConfirmHelpState = {
    open: boolean;
    task: Task | null;
    reasonLabel: string;
    reasonValue: string;
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

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [helpMenu, setHelpMenu] = useState<HelpMenuState>({
        task: null,
        x: 0,
        y: 0,
        show: false,
        showReasons: false,
    });
    const [confirmHelp, setConfirmHelp] = useState<ConfirmHelpState>({
        open: false,
        task: null,
        reasonLabel: "",
        reasonValue: "",
    });

    const apiBase = useMemo(() => {
        const base =
            process.env.NEXT_PUBLIC_API_URL || "/api";
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

    useEffect(() => {
        if (!helpMenu.show) return;
        const handleClick = () =>
            setHelpMenu((prev) => ({
                ...prev,
                show: false,
                showReasons: false,
            }));
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [helpMenu.show]);

    const handleOpenHelpMenu = (event: React.MouseEvent, task: Task) => {
        event.preventDefault();
        setHelpMenu({
            task,
            x: event.clientX,
            y: event.clientY,
            show: true,
            showReasons: false,
        });
    };

    const handleSendHelp = async (taskId: number, reason: string) => {
        const userId = getCookie("user_id");
        if (!userId) return;

        try {
            const response = await fetch(`${apiBase}/tasks/${taskId}/help`, {
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
                alert("通知の送信に失敗しました");
                return;
            }

            alert("PMに通知しました");
        } catch (err) {
            console.error("通知送信エラー:", err);
            alert("通知の送信に失敗しました");
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    タスク一覧
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    タスクを管理・確認できます
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">タスクがありません</p>
                    <p className="text-gray-400 text-sm mt-2">
                        新しいタスクを作成してください
                    </p>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {tasks.map((task) => (
                        <Link
                            key={task.id}
                            href={`/projects/tasks/${task.id}`}
                            className="block bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200"
                            onContextMenu={(event) =>
                                handleOpenHelpMenu(event, task)
                            }
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                                        {task.overview}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">
                                                プロジェクト:
                                            </span>
                                            <span className="font-medium">
                                                {task.project?.overview ||
                                                    "未設定"}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">
                                                ステータス:
                                            </span>
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                {task.status?.name || "未設定"}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">
                                                優先度:
                                            </span>
                                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                {task.priority?.name ||
                                                    "未設定"}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">
                                                担当者:
                                            </span>
                                            <span className="font-medium">
                                                {task.user?.name || "未設定"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-blue-600 ml-4">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {helpMenu.show && helpMenu.task && (
                <div
                    className="fixed z-50"
                    style={{ top: helpMenu.y, left: helpMenu.x }}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-64 p-3">
                        {!helpMenu.showReasons ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setHelpMenu((prev) => ({
                                        ...prev,
                                        showReasons: true,
                                    }))
                                }
                                className="w-full text-left text-sm text-gray-700 hover:text-blue-600"
                            >
                                PMに通知
                            </button>
                        ) : (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">
                                    何に困っていますか？
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {helpReasons.map((reason) => (
                                        <button
                                            key={reason.value}
                                            type="button"
                                            onClick={() => {
                                                setConfirmHelp({
                                                    open: true,
                                                    task: helpMenu.task,
                                                    reasonLabel: reason.label,
                                                    reasonValue: reason.value,
                                                });
                                                setHelpMenu({
                                                    task: null,
                                                    x: 0,
                                                    y: 0,
                                                    show: false,
                                                    showReasons: false,
                                                });
                                            }}
                                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
                                        >
                                            {reason.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {confirmHelp.open && confirmHelp.task && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            送信しますか？
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            「{confirmHelp.task.overview}」について「
                            {confirmHelp.reasonLabel}」でPMに通知します。
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfirmHelp({
                                        open: false,
                                        task: null,
                                        reasonLabel: "",
                                        reasonValue: "",
                                    })
                                }
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleSendHelp(
                                        confirmHelp.task.id,
                                        confirmHelp.reasonValue,
                                    );
                                    setConfirmHelp({
                                        open: false,
                                        task: null,
                                        reasonLabel: "",
                                        reasonValue: "",
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
        </div>
    );
}
