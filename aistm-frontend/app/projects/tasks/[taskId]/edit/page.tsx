'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Input from "../../../../(components)/input";
import Button from "../../../../(components)/button";
import Select from "../../../../(components)/select";
import Textarea from "../../../../(components)/textarea";
import Date from "../../../../(components)/date";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface MasterData {
    statuses: Array<{ id: number; name: string }>;
    priorities: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string; email: string }>;
    projects: Array<{ id: number; overview: string }>;
}

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params?.taskId as string;
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
    const [taskLoading, setTaskLoading] = useState(true);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    // タスクデータを取得
    useEffect(() => {
        if (!taskId) return;

        const fetchTask = async () => {
            setTaskLoading(true);
            setError("");
            try {
                const response = await fetch(`${apiBase}/tasks/${taskId}`);
                const contentType = response.headers.get("content-type");
                
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("データの取得に失敗しました");
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || "タスクの取得に失敗しました");
                }

                const data = await response.json().catch(() => {
                    throw new Error("レスポンスの解析に失敗しました");
                });
                
                if (data) {
                    // 既存データをフォームに設定
                    setFormData({
                        overview: data.overview || "",
                        project_id: data.project?.id?.toString() || "",
                        status_id: data.status?.id?.toString() || "",
                        priority_id: data.priority?.id?.toString() || "",
                        detail: data.detail || "",
                        user_id: data.user?.id?.toString() || "",
                        start_date: data.start_date || "",
                        schedule: data.schedule || "",
                        related_url: data.related_url || "",
                    });
                }
            } catch (err) {
                console.error("タスク取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setTaskLoading(false);
            }
        };

        fetchTask();
    }, [taskId, apiBase]);

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
            const response = await fetch(`${apiBase}/tasks/${taskId}`, {
                method: "PUT",
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
                throw new Error(data.message || "タスクの更新に失敗しました");
            }

            alert("タスクが正常に更新されました");
            router.push(`/projects/tasks/${taskId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    if (taskLoading || masterDataLoading) {
        return (
            <div className="w-full">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">データを読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href={`/projects/tasks/${taskId}`} className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block">
                    ← タスク詳細に戻る
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">タスク編集</h1>
                <p className="text-gray-600">タスク情報を編集します</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

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
                        isPriority={true}
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
                            button_title={loading ? "更新中..." : "タスクを更新"}
                            disabled={loading || masterDataLoading || masterData.statuses.length === 0 || masterData.priorities.length === 0 || masterData.projects.length === 0}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
