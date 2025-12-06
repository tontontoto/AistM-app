"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TaskDetails from "@/components/TaskDetails";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    // params.taskId は string | string[] | undefined
    const raw = params?.taskId;
    const selectedId = Array.isArray(raw) ? raw[0] : raw;

    const tasks = [
        { id: 1, title: "task1" },
        { id: 2, title: "task2" },
        { id: 3, title: "task3" },
    ];

    return (
        <div className="min-h-screen">
            <main className="w-full mx-auto px-4 py-6 flex flex-row gap-4">
                <div className="w-[20%] border-r-2 border-gray-300">
                    <h3 className="font-bold mb-3">タスク一覧</h3>
                    <ul className="flex flex-col gap-2">
                        {tasks.map((t) => (
                            <li key={t.id}>
                                <Link
                                    href={`/projects/tasks/${t.id}`}
                                    className="text-blue-600 underline"
                                >
                                    {t.title} (id: {t.id})
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4">{children}</div>
                </div>

                <div className="flex-1">
                    <TaskDetails selectedId={selectedId ?? null} />
                </div>
            </main>
        </div>
    );
}
