'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Input from "../../../(components)/input";
import Button from "../../../(components)/button";
import Select from "../../../(components)/select";
import Textarea from "../../../(components)/textarea";
import Date from "../../../(components)/date";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { maskEmail } from "@/utils/maskEmail";

interface MasterData {
    statuses: Array<{ id: number; name: string }>;
    priorities: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string; email: string; username?: string }>;
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
    const [selectedUsers, setSelectedUsers] = useState<MasterData["users"]>([]);
    const [userSearch, setUserSearch] = useState("");

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
                        schedule: formattedSchedule,
                        related_url: data.related_url || "",
                    });
                    if (Array.isArray(data.users) && data.users.length > 0) {
                        setSelectedUsers(data.users);
                    } else if (data.user) {
                        setSelectedUsers([data.user]);
                    }
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

        if (selectedUsers.length === 0) {
            setError("担当者を1人以上追加してください");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiBase}/projects/${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    user_ids: selectedUsers.map(user => user.id),
                }),
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
                    <div>
                        <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-2">
                            担当者
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="userSearch"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="名前やメールで検索して追加"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        {userSearch.trim() && (
                            <div className="mt-2 border border-gray-200 rounded-lg bg-white max-h-40 overflow-y-auto">
                                {masterData.users
                                    .filter(user => {
                                        const query = userSearch.toLowerCase();
                                        const name = (user.name || "").toLowerCase();
                                        const email = (user.email || "").toLowerCase();
                                        const username = (user.username || "").toLowerCase();
                                        return (
                                            (name.includes(query) || email.includes(query) || username.includes(query))
                                            && !selectedUsers.some(selected => selected.id === user.id)
                                        );
                                    })
                                    .map(user => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => {
                                                setSelectedUsers(prev => [...prev, user]);
                                                setUserSearch("");
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm"
                                        >
                                            {user.name || user.username || "名前なし"} ({maskEmail(user.email)})
                                        </button>
                                    ))}
                            </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <span
                                    key={user.id}
                                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                                >
                                    {user.name || user.username || "名前なし"}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUsers(prev => prev.filter(selected => selected.id !== user.id))}
                                        className="text-blue-500 hover:text-blue-700"
                                        aria-label="担当者を削除"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedUsers.length === 0 && (
                                <span className="text-sm text-gray-400">担当者が未選択です</span>
                            )}
                        </div>
                    </div>
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
