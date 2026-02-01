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
}

export default function AddProjectPage() {
    const router = useRouter();
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
                
                // デフォルト値を設定
                if (data.statuses.length > 0) {
                    setFormData(prev => ({ ...prev, status_id: data.statuses[0].id.toString() }));
                }
                if (data.priorities.length > 0) {
                    setFormData(prev => ({ ...prev, priority_id: data.priorities[0].id.toString() }));
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
            const response = await fetch(`${apiBase}/projects`, {
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
                throw new Error(data.message || "プロジェクトの作成に失敗しました");
            }

            alert("プロジェクトが正常に作成されました");
            router.push("/projects");
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen from-gray-50 via-white to-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                        <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {masterDataLoading ? (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 md:p-10">
                        <div className="flex items-center justify-center py-12">
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
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl  md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 基本情報セクション */}
                            <div className="border-b border-gray-100 pb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    基本情報
                                </h2>
                                <div className="space-y-6">
                                    {/* プロジェクト名 - 大きめに表示 */}
                                    <div className="w-full">
                                        <label htmlFor="overview" className="block text-lg font-semibold text-gray-800 mb-3">
                                            プロジェクト名
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="overview"
                                            name="overview"
                                            value={formData.overview}
                                            onChange={handleChange}
                                            required
                                            placeholder="プロジェクト名を入力してください"
                                            className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 placeholder-gray-400 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select
                                            select_title="プロジェクトステータス"
                                            select_name="status_id"
                                            select_id="status_id"
                                            options={masterData.statuses.map((s) => ({ value: s.id.toString(), label: s.name }))}
                                            value={formData.status_id}
                                            onChange={handleChange}
                                            required
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
                                    </div>
                                </div>
                            </div>

                            {/* 詳細情報セクション */}
                            <div className="border-b border-gray-100 pb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    詳細情報
                                </h2>
                                <div className="space-y-6">
                                    <Textarea 
                                        textarea_title="プロジェクトの説明"
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
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <Link
                                    href="/projects"
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    キャンセル
                                </Link>
                                <Button 
                                    button_type="submit" 
                                    button_title={loading ? "作成中..." : "プロジェクトを作成"}
                                    disabled={loading || masterDataLoading || masterData.statuses.length === 0 || masterData.priorities.length === 0}
                                />
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

