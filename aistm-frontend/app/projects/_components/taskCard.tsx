import React from "react";

type Task = {
    title: string
    assignee: string
    status: string
    dueDate: string
}

export default function TaskCard({ task }: { task: Task }) {
    return (
        <div className="border p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">{task.title}</h3>
            <p>担当者: {task.assignee}</p>
            <p>ステータス: {task.status}</p>
            <p>期限: {task.dueDate}</p>
        </div>
    );
}
