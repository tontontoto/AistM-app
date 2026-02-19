'use client';

import React, { useState, useEffect, useMemo } from "react";
import Input from "../../(components)/input";
import Button from "../../(components)/button";
import Select from "../../(components)/select";
import Textarea from "../../(components)/textarea";
import Date from "../../(components)/date";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MasterData {
    statuses: Array<{ id: number; name: string }>;
    priorities: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string; email: string }>;
    projects: Array<{ id: number; overview: string }>;
}

export default function AddTaskPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        overview: "",
        project_id: "",
        status_id: "",
        priority_id: "",
        detail: "",
        user_id: "",
        start_date: "",
        schedule: "",
        related_url: "",
    });
    const [masterData, setMasterData] = useState<MasterData>({
        statuses: [],
        priorities: [],
        users: [],
        projects: [],
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [masterDataLoading, setMasterDataLoading] = useState(true);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    // マスターデータを取得
    useEffect(() => {
        const fetchMasterData = async () => {
            setMasterDataLoading(true);
            setError("");
            try {
                // マスターデータとプロジェクト一覧を並行して取得
                const [masterResponse, projectsResponse] = await Promise.all([
                    fetch(`${apiBase}/master/all`),
                    fetch(`${apiBase}/master/projects`),
                ]);

                if (!masterResponse.ok) {
                    const contentType = masterResponse.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await masterResponse.json().catch(() => null);
                        throw new Error(errorData?.message || `マスターデータの取得に失敗しました (${masterResponse.status})`);
                    } else {
                        throw new Error(`マスターデータの取得に失敗しました (${masterResponse.status})`);
                    }
                }
                if (!projectsResponse.ok) {
                    const contentType = projectsResponse.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await projectsResponse.json().catch(() => null);
                        throw new Error(errorData?.message || `プロジェクト一覧の取得に失敗しました (${projectsResponse.status})`);
                    } else {
                        throw new Error(`プロジェクト一覧の取得に失敗しました (${projectsResponse.status})`);
                    }
                }

                const masterData = await masterResponse.json().catch(() => {
                    throw new Error("マスターデータのレスポンスがJSON形式ではありません");
                });
                const projects = await projectsResponse.json().catch(() => {
                    throw new Error("プロジェクト一覧のレスポンスがJSON形式ではありません");
                });

                // データの検証
                if (!masterData.statuses || !masterData.priorities || !masterData.users) {
                    throw new Error("マスターデータの形式が正しくありません");
                }

                setMasterData({
                    ...masterData,
                    projects: projects || [],
                });

                // デフォルト値を設定
                if (masterData.statuses.length > 0) {
                    setFormData(prev => ({ ...prev, status_id: masterData.statuses[0].id.toString() }));
                }
                if (masterData.priorities.length > 0) {
                    setFormData(prev => ({ ...prev, priority_id: masterData.priorities[0].id.toString() }));
                }
                if (projects.length > 0) {
                    setFormData(prev => ({ ...prev, project_id: projects[0].id.toString() }));
                }
            } catch (err) {
                console.error("マスターデータの取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setMasterDataLoading(false);
            }
        };

        fetchMasterData();
    }, [apiBase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, name, value } = e.target;
        const fieldName = id || name;
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${apiBase}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("サーバーからのレスポンスがJSON形式ではありません。APIサーバーが起動しているか確認してください。");
            }

            const data = await response.json().catch(() => {
                throw new Error("レスポンスの解析に失敗しました");
            });

            if (!response.ok) {
                throw new Error(data.message || "タスクの作成に失敗しました");
            }

            alert("タスクが正常に作成されました");
            router.push("/projects/tasks");
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto">
                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                        <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm sm:text-base text-red-700">{error}</p>
                    </div>
                )}

                {masterDataLoading ? (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-center py-10">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500">マスターデータを読み込み中...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 基本情報セクション */}
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-base font-semibold text-gray-800 mb-3">基本情報</h2>
                                <div className="space-y-4">
                                    {/* タスク名 */}
                                    <div className="w-full">
                                        <label htmlFor="overview" className="block text-sm font-semibold text-gray-800 mb-2">
                                            タスク名
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="overview"
                                            name="overview"
                                            value={formData.overview}
                                            onChange={handleChange}
                                            required
                                            placeholder="タスク名を入力してください"
                                            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 placeholder-gray-400 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            select_title="親プロジェクトの選択"
                                            select_name="project_id"
                                            select_id="project_id"
                                            options={masterData.projects.map((p) => ({ value: p.id.toString(), label: p.overview }))}
                                            value={formData.project_id}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Select
                                            select_title="タスクステータス"
                                            select_name="status_id"
                                            select_id="status_id"
                                            options={masterData.statuses.map((s) => ({ value: s.id.toString(), label: s.name }))}
                                            value={formData.status_id}
                                            onChange={handleChange}
                                            required
                                            isStatus={true}
                                        />
                                        <Select
                                            select_title="タスク優先度"
                                            select_name="priority_id"
                                            select_id="priority_id"
                                            options={masterData.priorities.map((p) => ({ value: p.id.toString(), label: p.name }))}
                                            value={formData.priority_id}
                                            onChange={handleChange}
                                            required
                                            isPriority={true}
                                        />
                                        <Select
                                            select_title="担当者"
                                            select_name="user_id"
                                            select_id="user_id"
                                            options={masterData.users.map((u) => ({ value: u.id.toString(), label: `${u.name} (${u.email})` }))}
                                            value={formData.user_id}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Date 
                                            label="開始日"
                                            id="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                        />
                                        <Date 
                                            label="期限"
                                            id="schedule"
                                            value={formData.schedule}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 詳細情報セクション */}
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-base font-semibold text-gray-800 mb-3">詳細情報</h2>
                                <div className="space-y-4">
                                    <Textarea 
                                        textarea_title="タスクの説明"
                                        id="detail"
                                        value={formData.detail}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        input_title="関連リンク"
                                        input_id="related_url"
                                        input_type="url"
                                        input_pattern="https://.*"
                                        value={formData.related_url}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* 送信ボタン */}
                            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                                <Link
                                    href="/projects/tasks"
                                    className="w-full sm:w-auto text-center px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    キャンセル
                                </Link>
                                <div className="w-full sm:w-auto">
                                    <Button 
                                        button_type="submit" 
                                        button_title={loading ? "作成中..." : "タスクを作成"}
                                        disabled={loading || masterDataLoading || masterData.statuses.length === 0 || masterData.priorities.length === 0 || masterData.projects.length === 0}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
