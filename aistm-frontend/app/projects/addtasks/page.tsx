'use client';

import React, { useState, useEffect, useMemo } from "react";
import Input from "../../(components)/input";
import Button from "../../(components)/button";
import Select from "../../(components)/select";
import Textarea from "../../(components)/textarea";
import Date from "../../(components)/date";
import { useRouter } from "next/navigation";

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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">タスク新規作成</h1>
                <p className="text-gray-600">新しいタスクを作成します</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {masterDataLoading ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">マスターデータを読み込み中...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            input_title="タスク概要"
                            input_id="overview"
                            input_type="text"
                            input_pattern={""}
                            value={formData.overview}
                            onChange={handleChange}
                            required
                        />
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
                        />
                        <Select
                            select_title="タスク優先度"
                            select_name="priority_id"
                            select_id="priority_id"
                            options={masterData.priorities.map((p) => ({ value: p.id.toString(), label: p.name }))}
                            value={formData.priority_id}
                            onChange={handleChange}
                            required
                        />
                        <Textarea 
                            textarea_title="タスクの説明"
                            id="detail"
                            value={formData.detail}
                            onChange={handleChange}
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
                            id="schedule"
                            value={formData.schedule}
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
                        <div className="pt-4 border-t border-gray-200">
                            <Button 
                                button_type="submit" 
                                button_title={loading ? "作成中..." : "タスクを作成"}
                                disabled={loading || masterDataLoading || masterData.statuses.length === 0 || masterData.priorities.length === 0 || masterData.projects.length === 0}
                            />
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
