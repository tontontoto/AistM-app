"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskCard from "./_components/taskCard";
import UserAvatar from "../../../components/UserAvatar";
import { maskEmail } from "@/utils/maskEmail";

type User = {
    id: number;
    username: string;
    name: string;
    email: string;
    login_count: number;
    avatar_color?: string;
    skills?: Array<{ id: number; name: string }>;
};

type Project = {
    id: number;
    overview: string;
    status: {
        name: string;
    };
};

type Task = {
    id: number;
    overview: string;
    project: {
        overview: string;
    };
    status: {
        name: string;
    };
};

// Cookieから値を取得する関数
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState("#3B82F6");
    const [updatingColor, setUpdatingColor] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [savingSkills, setSavingSkills] = useState(false);

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
            try {
                const [userResponse, projectsResponse, tasksResponse] =
                    await Promise.all([
                        fetch(`${apiBase}/users/${userId}`),
                        fetch(`${apiBase}/users/${userId}/projects`),
                        fetch(`${apiBase}/users/${userId}/tasks`),
                    ]);

                // ユーザー情報の取得
                if (userResponse.ok) {
                    const contentType =
                        userResponse.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const userData = await userResponse
                            .json()
                            .catch(() => null);
                        if (userData) {
                            setUser(userData);
                            setSelectedColor(
                                userData.avatar_color || "#3B82F6",
                            );
                            setSkills(
                                Array.isArray(userData.skills)
                                    ? userData.skills.map(
                                          (skill: { name: string }) =>
                                              skill.name,
                                      )
                                    : [],
                            );
                        }
                    }
                } else if (userResponse.status === 404) {
                    setError("ユーザーが見つかりません");
                }

                // プロジェクトの取得
                if (projectsResponse.ok) {
                    const contentType =
                        projectsResponse.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const data = await projectsResponse
                            .json()
                            .catch(() => []);
                        setProjects(Array.isArray(data) ? data : []);
                    }
                }

                // タスクの取得
                if (tasksResponse.ok) {
                    const contentType =
                        tasksResponse.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const data = await tasksResponse.json().catch(() => []);
                        setTasks(Array.isArray(data) ? data : []);
                    }
                }
            } catch (err) {
                console.error("データ取得エラー:", err);
                setError("データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiBase]);

    // アバター色を更新
    const handleColorChange = async (color: string) => {
        const userId = getCookie("user_id");
        if (!userId || !user) return;

        setUpdatingColor(true);
        try {
            const response = await fetch(`${apiBase}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ avatar_color: color }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser({ ...user, avatar_color: color });
                setSelectedColor(color);
                setShowColorPicker(false);

                // ヘッダーなどに即時反映
                localStorage.setItem(`avatar_color_${userId}`, color);
                window.dispatchEvent(
                    new CustomEvent("avatarColorUpdated", {
                        detail: { userId, color },
                    }),
                );
            }
        } catch (err) {
            console.error("色の更新エラー:", err);
        } finally {
            setUpdatingColor(false);
        }
    };

    const colorPresets = [
        "#3B82F6",
        "#EF4444",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#06B6D4",
        "#84CC16",
        "#F97316",
        "#6366F1",
    ];

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (!trimmed) return;
        if (skills.includes(trimmed)) {
            setSkillInput("");
            return;
        }
        setSkills((prev) => [...prev, trimmed]);
        setSkillInput("");
    };

    const handleRemoveSkill = (name: string) => {
        setSkills((prev) => prev.filter((skill) => skill !== name));
    };

    const handleSaveSkills = async () => {
        const userId = getCookie("user_id");
        if (!userId) return;
        setSavingSkills(true);
        try {
            const response = await fetch(`${apiBase}/users/${userId}/skills`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ skills }),
            });

            if (!response.ok) {
                throw new Error("スキルの保存に失敗しました");
            }
        } catch (err) {
            console.error("スキル保存エラー:", err);
        } finally {
            setSavingSkills(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-semibold mb-2">エラー</p>
                    <p className="text-red-700 mb-4">
                        {error || "ユーザー情報を取得できませんでした"}
                    </p>
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                    >
                        ログインページに戻る →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    ユーザープロフィール
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    あなたのプロジェクトとタスクを確認できます
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* プロフィール情報 */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-3 sm:mb-4">
                                <UserAvatar
                                    name={user.name}
                                    username={user.username}
                                    email={user.email}
                                    avatarColor={user.avatar_color}
                                    size="xl"
                                />
                                <button
                                    onClick={() =>
                                        setShowColorPicker(!showColorPicker)
                                    }
                                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                                    title="アバター色を変更"
                                >
                                    <svg
                                        className="w-4 h-4 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* カラーピッカー */}
                            {showColorPicker && (
                                <div className="mb-4 w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                        アバター色を選択
                                    </h4>
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {colorPresets.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() =>
                                                    handleColorChange(color)
                                                }
                                                disabled={updatingColor}
                                                className={`w-10 h-10 rounded-full transition-all ${
                                                    selectedColor === color
                                                        ? "ring-2 ring-offset-2 ring-blue-500"
                                                        : "hover:scale-110"
                                                }`}
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={selectedColor}
                                            onChange={(e) =>
                                                setSelectedColor(e.target.value)
                                            }
                                            className="w-12 h-10 rounded cursor-pointer"
                                        />
                                        <button
                                            onClick={() =>
                                                handleColorChange(selectedColor)
                                            }
                                            disabled={updatingColor}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            {updatingColor
                                                ? "更新中..."
                                                : "カスタム色を適用"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                                {user.name || user.username || "ユーザー"}
                            </h3>
                            <div className="text-center space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {maskEmail(user.email)}
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    ログイン回数: {user.login_count || 0}回
                                </p>
                            </div>
                            <div className="w-full border-t border-gray-200 pt-4">
                                <button
                                    onClick={() => {
                                        document.cookie =
                                            "auth=; Path=/; Max-Age=0";
                                        document.cookie =
                                            "user_id=; Path=/; Max-Age=0";
                                        router.push("/login");
                                    }}
                                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    ログアウト
                                </button>
                            </div>
                            <div className="w-full border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    スキル
                                </h4>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) =>
                                            setSkillInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddSkill();
                                            }
                                        }}
                                        placeholder="例: React"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                    >
                                        追加
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {skills.length === 0 ? (
                                        <span className="text-xs text-gray-400">
                                            登録されたスキルがありません
                                        </span>
                                    ) : (
                                        skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSkill(skill)
                                                    }
                                                    className="text-blue-500 hover:text-blue-700"
                                                    aria-label="スキルを削除"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveSkills}
                                    disabled={savingSkills}
                                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {savingSkills
                                        ? "保存中..."
                                        : "スキルを保存"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* プロジェクトとタスク */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* 在籍プロジェクト */}
                    <div>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                在籍プロジェクト
                            </h2>
                            <Link
                                href="/projects/addproject"
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                + 新規作成
                            </Link>
                        </div>
                        {projects.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500 mb-2">
                                    プロジェクトがありません
                                </p>
                                <Link
                                    href="/projects/addproject"
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                    新しいプロジェクトを作成する →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(0, 5).map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-800">
                                                {project.overview}
                                            </span>
                                            {project.status && (
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {project.status.name}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                                {projects.length > 5 && (
                                    <Link
                                        href="/projects"
                                        className="block text-center text-blue-600 hover:text-blue-800 hover:underline py-2"
                                    >
                                        すべてのプロジェクトを見る (
                                        {projects.length}件) →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 作業タスク */}
                    <div>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                あなたの作業タスク
                            </h2>
                            <Link
                                href="/projects/addtasks"
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                + 新規作成
                            </Link>
                        </div>
                        {tasks.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500 mb-2">
                                    タスクがありません
                                </p>
                                <Link
                                    href="/projects/addtasks"
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                    新しいタスクを作成する →
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                {tasks.slice(0, 5).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/projects/tasks/${task.id}`}
                                        className="block"
                                    >
                                        <TaskCard
                                            task_title={task.overview}
                                            task_id={task.id}
                                        />
                                    </Link>
                                ))}
                                {tasks.length > 5 && (
                                    <Link
                                        href="/projects/tasks"
                                        className="block text-center text-blue-600 hover:text-blue-800 hover:underline py-2"
                                    >
                                        すべてのタスクを見る ({tasks.length}件)
                                        →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
