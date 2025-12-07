import React from "react";
import Image from "next/image";
import ProjectCard from "./_components/projectCard";
import TaskCard from "./_components/taskCard";

export default function page() {
    const tasks = [
        { id: 1, title: "task1" },
        { id: 2, title: "task2" },
        { id: 3, title: "task3" },
    ];

    return (
        <div className="w-[1100px] mx-auto my-14 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">ユーザープロフィール</h2>
            <div className="w-full flex flex-row gap-10">
                <div className="w-full flex flex-col items-center">
                    <Image
                        src="/icon.png"
                        alt="Profile"
                        width={150}
                        height={150}
                        className="rounded-full"
                    />
                    <h3 className="text-xl font-semibold mt-4">田中太郎</h3>
                    <div className="text-left">
                        <p>連絡先；example@example.com</p>
                        <p>所属；開発部</p>
                    </div>
                </div>
                <div className=" w-full flex flex-col gap-10">
                    <div className="w-full">
                        <h4 className="font-bold text-2xl">在籍プロジェクト</h4>
                        <ProjectCard project_title="プロジェクトA" />
                    </div>
                    <div className="w-full">
                        <h4 className="font-bold text-2xl">
                            あなたの作業タスク
                        </h4>
                        
                        <div className="border border-gray-300 rounded-lg px-3">
                            {tasks.map((t) => (
                                <TaskCard key={t.id} task_title={t.title} task_id={t.id} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
