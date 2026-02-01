"use client";

import React, { useState } from "react";
import Link from "next/link";

type Task = {
    id: number;
    title: string;
    assignee: string;
    status: string;
    statusId: number;
    priority: string;
};

const statusOptions = [
    { id: 1, name: "企画中" },
    { id: 2, name: "進行中" },
    { id: 3, name: "完了" },
    { id: 4, name: "保留中" },
];

const priorityStyles: Record<string, { shadow: string; badge: string }> = {
    高: {
        shadow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        badge: "bg-red-100 text-red-800",
    },
    中: {
        shadow: "shadow-[0_0_15px_rgba(251,191,36,0.4)]",
        badge: "bg-yellow-100 text-yellow-800",
    },
    低: {
        shadow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
        badge: "bg-green-100 text-green-800",
    },
};

export default function TaskCard({
    task,
    onStatusChange,
}: {
    task: Task;
    onStatusChange?: (id: number, statusId: number, statusName: string) => Promise<void> | void;
}) {
    const [statusId, setStatusId] = useState(task.statusId);
    const [statusName, setStatusName] = useState(task.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const priority = priorityStyles[task.priority] || priorityStyles["低"];

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const newStatusId = Number(e.target.value);
        const newStatusOption = statusOptions.find(s => s.id === newStatusId);
        if (!newStatusOption) return;
        
        const prevStatusId = statusId;
        const prevStatusName = statusName;
        setStatusId(newStatusId);
        setStatusName(newStatusOption.name);
        
        if (onStatusChange) {
            setIsUpdating(true);
            try {
                await onStatusChange(task.id, newStatusId, newStatusOption.name);
            } catch (error) {
                // エラー時は元のステータスに戻す
                setStatusId(prevStatusId);
                setStatusName(prevStatusName);
                console.error("ステータスの更新に失敗しました:", error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className={`bg-white border border-gray-200 rounded-xl p-6 ${priority.shadow} transition-all duration-200 h-full flex flex-col relative`}
        >
            <Link
                href={`/projects/${task.id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="編集"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </Link>
            <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 pr-8">
                {task.title}
            </h3>
            <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">
                        担当者:
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                        {task.assignee}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">
                        ステータス:
                    </span>
                    <select
                        value={statusId}
                        onChange={handleStatusChange}
                        onClick={handleSelectClick}
                        disabled={isUpdating}
                        className={`text-sm font-medium text-gray-700 border border-gray-300 rounded-md px-2 py-1 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${isUpdating ? "opacity-50" : ""}`}
                    >
                        {statusOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {isUpdating && <span className="text-xs text-gray-400">更新中...</span>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">
                        優先度:
                    </span>
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${priority.badge}`}
                    >
                        {task.priority}
                    </span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link
                        href={`/projects/${task.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium"
                    >
                        詳細を見る
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
