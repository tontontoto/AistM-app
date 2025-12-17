"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TaskDetails from "@/components/TaskDetails";

export default function TasksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const raw = params?.taskId;
    const selectedId = Array.isArray(raw) ? raw[0] : raw;

    const [tasks, setTasks] = useState<Array<{ id: number; overview: string }>>([]);
    const [loading, setLoading] = useState(true);

    const apiBase = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
        return base.replace(/\/+$/, "");
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${apiBase}/tasks`);
                const contentType = response.headers.get("content-type");
                if (response.ok && contentType && contentType.includes("application/json")) {
                    const data = await response.json().catch(() => []);
                    const tasksArray = Array.isArray(data) ? data : [];
                    setTasks(tasksArray.map((task: any) => ({
                        id: task.id,
                        overview: task.overview,
                    })));
                } else {
                    // エラーまたはJSONでない場合は空配列
                    setTasks([]);
                }
            } catch (err) {
                console.error("タスク取得エラー:", err);
                // エラーが発生した場合は空配列
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [apiBase]);

    return (
        <div className="min-h-screen">
            <main className="w-full mx-auto px-4 py-6 flex flex-row gap-4">
                <div className="w-[20%] border-r-2 border-gray-300">
                    <h3 className="font-bold mb-3">タスク一覧</h3>
                    {loading ? (
                        <div className="text-sm text-gray-600">読み込み中...</div>
                    ) : tasks.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {tasks.map((t) => (
                                <li key={t.id}>
                                    <Link
                                        href={`/projects/tasks/${t.id}`}
                                        className={`text-blue-600 underline ${
                                            selectedId === t.id.toString() ? "font-bold" : ""
                                        }`}
                                    >
                                        {t.overview} (id: {t.id})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <div className="mt-4">{children}</div>
                </div>

                <div className="flex-1">
                    <TaskDetails selectedId={selectedId ?? null} />
                </div>
            </main>
        </div>
    );
}
