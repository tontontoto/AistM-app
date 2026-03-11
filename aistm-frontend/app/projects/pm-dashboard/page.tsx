"use client";

import React, { useEffect, useMemo, useState } from "react";

type SkillCoverage = {
    total_required: number;
    covered: number;
    percent: number;
    missing: string[];
};

type StalledTask = {
    id: number;
    overview: string;
    schedule: string;
    created_at: string;
    halfway_at: string;
    last_help_at: string | null;
};

type ProjectSummary = {
    id: number;
    overview: string;
    status?: { id: number; name: string };
    priority?: { id: number; name: string };
    members_count: number;
    skills_required: string[];
    skill_coverage: SkillCoverage;
    sos_count: number;
    stalled_tasks: StalledTask[];
};

type DashboardData = {
    projects: ProjectSummary[];
    totals: {
        sos_count: number;
        stalled_tasks_count: number;
    };
};

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function PmDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});
    const [savingSkills, setSavingSkills] = useState<Record<number, boolean>>(
        {},
    );

    const apiBase = useMemo(() => {
        const base =
            process.env.NEXT_PUBLIC_API_URL || "/api";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const userId = getCookie("user_id");
        if (!userId) {
            setError("ログインが必要です");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${apiBase}/pm-dashboard?user_id=${userId}`,
                );
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("データの取得に失敗しました");
                }
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(
                        errorData?.message || "データの取得に失敗しました",
                    );
                }
                const payload = await response.json();
                setData(payload);
            } catch (err) {
                console.error("PMダッシュボード取得エラー:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "データの読み込みに失敗しました",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiBase]);

    const handleAddSkill = (projectId: number) => {
        if (!data) return;
        const input = (skillInputs[projectId] || "").trim();
        if (!input) return;

        setData((prev) => {
            if (!prev) return prev;
            const projects = prev.projects.map((project) => {
                if (project.id !== projectId) return project;
                if (project.skills_required.includes(input)) return project;
                return {
                    ...project,
                    skills_required: [...project.skills_required, input],
                };
            });
            return { ...prev, projects };
        });

        setSkillInputs((prev) => ({ ...prev, [projectId]: "" }));
    };

    const handleRemoveSkill = (projectId: number, name: string) => {
        if (!data) return;
        setData((prev) => {
            if (!prev) return prev;
            const projects = prev.projects.map((project) => {
                if (project.id !== projectId) return project;
                return {
                    ...project,
                    skills_required: project.skills_required.filter(
                        (skill) => skill !== name,
                    ),
                };
            });
            return { ...prev, projects };
        });
    };

    const handleSaveSkills = async (projectId: number) => {
        if (!data) return;
        const project = data.projects.find((item) => item.id === projectId);
        if (!project) return;

        setSavingSkills((prev) => ({ ...prev, [projectId]: true }));
        try {
            const response = await fetch(
                `${apiBase}/projects/${projectId}/skills`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ skills: project.skills_required }),
                },
            );
            if (!response.ok) {
                throw new Error("スキルの保存に失敗しました");
            }
        } catch (err) {
            console.error("スキル保存エラー:", err);
        } finally {
            setSavingSkills((prev) => ({ ...prev, [projectId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="text-gray-500">読み込み中...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">
                        エラー: {error || "データを取得できませんでした"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    PM チーム・ヘルス・ダッシュボード
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    データに基づいて、次に誰へ声をかけるべきかを判断するための画面です。
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">SOSカウント</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {data.totals.sos_count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        全Help通知の総数
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">停滞タスク</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                        {data.totals.stalled_tasks_count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        進行中で滞留しているタスク
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">管理プロジェクト</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {data.projects.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        あなたが作成したプロジェクト
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {data.projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {project.overview}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    メンバー: {project.members_count}人
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {project.status?.name || "未設定"}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                    {project.priority?.name || "未設定"}
                                </span>
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    SOS {project.sos_count}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    スキル・カバレッジ
                                </p>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-2 bg-green-500"
                                            style={{
                                                width: `${project.skill_coverage.percent}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {project.skill_coverage.percent}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    充足: {project.skill_coverage.covered}/
                                    {project.skill_coverage.total_required}
                                </p>
                                {project.skill_coverage.missing.length > 0 && (
                                    <div className="mt-2 text-xs text-orange-600">
                                        未充足:{" "}
                                        {project.skill_coverage.missing.join(
                                            ", ",
                                        )}
                                    </div>
                                )}

                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">
                                        必要スキルの編集
                                    </p>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={
                                                skillInputs[project.id] || ""
                                            }
                                            onChange={(event) =>
                                                setSkillInputs((prev) => ({
                                                    ...prev,
                                                    [project.id]:
                                                        event.target.value,
                                                }))
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    handleAddSkill(project.id);
                                                }
                                            }}
                                            placeholder="例: React"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleAddSkill(project.id)
                                            }
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs"
                                        >
                                            追加
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {project.skills_required.length ===
                                        0 ? (
                                            <span className="text-xs text-gray-400">
                                                スキル未登録
                                            </span>
                                        ) : (
                                            project.skills_required.map(
                                                (skill) => (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                                                    >
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveSkill(
                                                                    project.id,
                                                                    skill,
                                                                )
                                                            }
                                                            className="text-blue-500 hover:text-blue-700"
                                                            aria-label="スキルを削除"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ),
                                            )
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSaveSkills(project.id)
                                        }
                                        disabled={savingSkills[project.id]}
                                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-xs disabled:opacity-50"
                                    >
                                        {savingSkills[project.id]
                                            ? "保存中..."
                                            : "必要スキルを保存"}
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    停滞タスク
                                </p>
                                {project.stalled_tasks.length === 0 ? (
                                    <p className="text-xs text-gray-500">
                                        停滞タスクはありません
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {project.stalled_tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white border border-gray-200 rounded-lg p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {task.overview}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            期限:{" "}
                                                            {task.schedule}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-right">
                                                        <p>
                                                            閾値:{" "}
                                                            {task.halfway_at}
                                                        </p>
                                                        <p>
                                                            最終Help:{" "}
                                                            {task.last_help_at ||
                                                                "未送信"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
