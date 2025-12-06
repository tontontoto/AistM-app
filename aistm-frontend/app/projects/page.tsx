import React from "react";
import TaskCard from "./_components/taskCard";


// タスクの仮データ
// タスクタイトル、担当者、タスクのステータス、期限
const tasks = [
    {
        title: "プロジェクト1",
        assignee: "山田太郎",
        status: "進行中",
        dueDate: "2024-12-31",
    },
    {
        title: "プロジェクト2",
        assignee: "鈴木花子",
        status: "未着手",
        dueDate: "2024-11-30",
    },
    {
        title: "プロジェクト3",
        assignee: "佐藤次郎",
        status: "完了",
        dueDate: "2024-10-15",
    },
]; 

export default function page() {
    return(
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task, index) => (
                    <TaskCard key={index} task={task} />
                ))}
            </div>
        </div>
    )
}
