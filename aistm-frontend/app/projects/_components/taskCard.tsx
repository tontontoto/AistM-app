import React from "react";
import Link from "next/link";

type Task = {
    id: number;
    title: string;
    assignee: string;
    status: string;
    dueDate: string;
}

export default function TaskCard({ task }: { task: Task }) {
    return (
        <Link href={`/projects/${task.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">{task.title}</h3>
                <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">担当者:</span>
                        <span className="text-sm font-medium text-gray-700">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ステータス:</span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {task.status}
                        </span>
                    </div>
                    {task.dueDate !== "未設定" && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">期限:</span>
                            <span className="text-sm text-gray-700">{task.dueDate}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
