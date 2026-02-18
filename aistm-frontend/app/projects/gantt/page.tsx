"use client";

import React, { useEffect, useMemo, useState } from "react";
import GanttChartClient, { type GanttRow } from "./GanttChartClient";

type ApiTask = {
    id: number;
    overview: string;
    created_at: string;
    schedule: string | null; // YYYY-MM-DD
    is_completed?: boolean;
    project?: { id: number; overview?: string } | null;
    user?: { id: number; name?: string; username?: string; email?: string } | null;
    status?: { name?: string } | null;
    priority?: { name?: string } | null;
};

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

function clampText(value: string, maxLen = 28): string {
    if (value.length <= maxLen) return value;
    return `${value.slice(0, Math.max(0, maxLen - 1))}…`;
}

function colorFromProjectId(projectId: number): string {
    // projectIdから安定した色を作る（HSL）
    const hue = (projectId * 47) % 360;
    return `hsl(${hue} 70% 45%)`;
}

function normalizeYmd(value: string): string {
    // "2026-02-10" も "2026-02-10T00:00:00.000000Z" も YYYY-MM-DD に揃える
    return value.slice(0, 10);
}

function parseEndOfDayUtc(scheduleDate: string): number {
    // YYYY-MM-DD(またはISO) -> UTCの23:59:59（小数秒なし）
    const ymd = normalizeYmd(scheduleDate);
    const iso = `${ymd}T23:59:59Z`;
    const ms = Date.parse(iso);
    return Number.isFinite(ms) ? ms : Date.now();
}

function parseStartOfDayUtcFromIso(isoDatetime: string): number {
    // created_at の日付部分(YYYY-MM-DD)を開始日にする
    const ymd = normalizeYmd(isoDatetime);
    const ms = Date.parse(`${ymd}T00:00:00Z`);
    return Number.isFinite(ms) ? ms : Date.now();
}

export default function GanttPage() {
    const [tasks, setTasks] = useState<ApiTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
    const [hideCompleted, setHideCompleted] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [limit, setLimit] = useState(60);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${apiBase}/tasks`);
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("サーバーからのレスポンスがJSON形式ではありません。APIサーバーが起動しているか確認してください。");
                }
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || "タスクの取得に失敗しました");
                }
                const data = (await response.json().catch(() => [])) as unknown;
                setTasks(Array.isArray(data) ? (data as ApiTask[]) : []);
            } catch (err) {
                console.error("タスク取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [apiBase]);

    const rows = useMemo<GanttRow[]>(() => {
        const myUserId = Number(getCookie("user_id") || "0");
        const key = keyword.trim().toLowerCase();

        const filtered = tasks
            .filter((task) => task.schedule)
            .filter((task) => (hideCompleted ? !task.is_completed : true))
            .filter((task) => (onlyMyTasks && myUserId ? task.user?.id === myUserId : true))
            .filter((task) => {
                if (!key) return true;
                const haystack = [
                    task.overview,
                    task.project?.overview || "",
                    task.user?.name || task.user?.username || task.user?.email || "",
                ]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(key);
            })
            .map((task) => {
                const startMs = parseStartOfDayUtcFromIso(task.created_at);
                const endMs = task.schedule ? parseEndOfDayUtc(task.schedule) : startMs;
                const safeStart = Number.isFinite(startMs) ? startMs : Date.now();
                const safeEnd = Number.isFinite(endMs) ? endMs : safeStart;

                const projectId = task.project?.id ?? 0;
                const projectName = task.project?.overview || "プロジェクト不明";
                const taskName = task.overview || "タスク";
                const assignee = task.user?.name || task.user?.username || task.user?.email || undefined;

                // y軸ラベルはユニークになるようIDを含める（重複ラベルだと同じ行に重なるため）
                const label = clampText(`#${task.id} ${taskName}`, 34);

                return {
                    id: task.id,
                    label,
                    startMs: Math.min(safeStart, safeEnd),
                    endMs: Math.max(safeStart, safeEnd),
                    color: projectId ? colorFromProjectId(projectId) : "hsl(210 10% 50%)",
                    meta: {
                        project: projectName,
                        task: taskName,
                        assignee,
                        status: task.status?.name || undefined,
                        priority: task.priority?.name || undefined,
                    },
                } satisfies GanttRow;
            })
            .sort((a, b) => a.endMs - b.endMs);

        return filtered.slice(0, limit);
    }, [tasks, onlyMyTasks, hideCompleted, keyword, limit]);

    return (
        <div className="w-full">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">ガントチャート（全体）</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    タスクの開始（作成日時）〜期限（schedule）を可視化します（期限が未設定のタスクは除外）。
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">検索</label>
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="プロジェクト名・タスク名・担当者で検索"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={onlyMyTasks}
                                onChange={(e) => setOnlyMyTasks(e.target.checked)}
                            />
                            自分担当のみ
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={hideCompleted}
                                onChange={(e) => setHideCompleted(e.target.checked)}
                            />
                            完了を除外
                        </label>

                        <div>
                            <label className="block text-xs text-gray-600 mb-1">表示件数</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value={30}>30</option>
                                <option value={60}>60</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">表示中: {rows.length}件</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">エラー: {error}</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">表示できるタスクがありません</p>
                    <p className="text-gray-400 text-sm mt-2">期限（schedule）が設定されたタスクが対象です</p>
                </div>
            ) : (
                <GanttChartClient rows={rows} />
            )}
        </div>
    );
}

