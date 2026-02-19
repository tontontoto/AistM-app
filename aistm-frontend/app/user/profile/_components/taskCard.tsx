import React from "react";
import Link from "next/link";

type Props = {
    task_title: string;
    task_id: number;
};

export default function TaskCard({ task_title, task_id }: Props) {
    return (
        <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4 my-4hover:bg-gray-100">
            <Link href={`/projects/tasks/${task_id}`} className="text-gray-600 underline text-sm font-bold">
                {task_title}
            </Link>
        </div>
    );
}
