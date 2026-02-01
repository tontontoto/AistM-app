'use client';

import React, { useState, useEffect, useMemo } from "react";
import Input from "../../../(components)/input";
import Button from "../../../(components)/button";
import Select from "../../../(components)/select";
import Textarea from "../../../(components)/textarea";
import Date from "../../../(components)/date";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface MasterData {
    statuses: Array<{ id: number; name: string }>;
    priorities: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string; email: string }>;
}

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params?.id as string;
    const [formData, setFormData] = useState({
        overview: "",
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
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [masterDataLoading, setMasterDataLoading] = useState(true);
    const [projectLoading, setProjectLoading] = useState(true);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    // プロジェクトデータを取得
    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            setProjectLoading(true);
            setError("");
            try {
                const response = await fetch(`${apiBase}/projects/${projectId}`);
                const contentType = response.headers.get("content-type");
                
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("データの取得に失敗しました");
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || "プロジェクトの取得に失敗しました");
                }

                const data = await response.json().catch(() => {
                    throw new Error("レスポンスの解析に失敗しました");
                });
                
                if (data) {
                    // 日付をYYYY-MM-DD形式で取得
                    let formattedSchedule = "";
                    if (data.schedule) {
                        // 日付文字列からYYYY-MM-DD部分を抽出
                        const scheduleStr = String(data.schedule);
                        const match = scheduleStr.match(/\d{4}-\d{2}-\d{2}/);
                        if (match) {
                            formattedSchedule = match[0];
                        }
                    }
                    
                    // 既存データをフォームに設定
                    setFormData({
                        overview: data.overview || "",
                        status_id: data.status?.id?.toString() || "",
                        priority_id: data.priority?.id?.toString() || "",
                        detail: data.detail || "",
                        user_id: data.user?.id?.toString() || "",
                        schedule: formattedSchedule,
                        related_url: data.related_url || "",
                    });
                }
            } catch (err) {
                console.error("プロジェクト取得エラー:", err);
                setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
            } finally {
                setProjectLoading(false);
            }
        };

        fetchProject();
    }, [projectId, apiBase]);

    // マスターデータを取得
    useEffect(() => {
        const fetchMasterData = async () => {
            setMasterDataLoading(true);
            setError("");
            try {
                const response = await fetch(`${apiBase}/master/all`);
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("サーバーからのレスポンスがJSON形式ではありません。APIサーバーが起動しているか確認してください。");
                }
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || `マスターデータの取得に失敗しました (${response.status})`);
                }
                const data = await response.json().catch(() => {
                    throw new Error("レスポンスの解析に失敗しました");
                });
                
                // データの検証
                if (!data.statuses || !data.priorities || !data.users) {
                    throw new Error("マスターデータの形式が正しくありません");
                }
                
                setMasterData(data);
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
            const response = await fetch(`${apiBase}/projects/${projectId}`, {
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
                throw new Error(data.message || "プロジェクトの更新に失敗しました");
            }

            alert("プロジェクトが正常に更新されました");
            router.push(`/projects/${projectId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    if (projectLoading || masterDataLoading) {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">プロジェクト編集</h1>
                <p className="text-gray-600">プロジェクト情報を編集します</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        input_title="プロジェクト概要"
                        input_id="overview"
                        input_type="text"
                        input_pattern={""}
                        value={formData.overview}
                        onChange={handleChange}
                        required
                    />
                    <Select
                        select_title="プロジェクトステータス"
                        select_name="status_id"
                        select_id="status_id"
                        options={masterData.statuses.map((s) => ({ value: s.id.toString(), label: s.name }))}
                        value={formData.status_id}
                        onChange={handleChange}
                        required
                        isStatus={true}
                    />
                    <Select
                        select_title="プロジェクト優先度"
                        select_name="priority_id"
                        select_id="priority_id"
                        options={masterData.priorities.map((p) => ({ value: p.id.toString(), label: p.name }))}
                        value={formData.priority_id}
                        onChange={handleChange}
                        required
                        isPriority={true}
                    />
                    <Textarea 
                        textarea_title="プロジェクトの説明"
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
                            button_title={loading ? "更新中..." : "プロジェクトを更新"}
                            disabled={loading || masterDataLoading || masterData.statuses.length === 0 || masterData.priorities.length === 0}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
