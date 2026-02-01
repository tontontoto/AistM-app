import React from "react";
import Link from "next/link";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navLinks = [
        { label: "プロジェクト一覧", href: "/projects" },
        { label: "タスク一覧", href: "/projects/tasks" },
        { label: "タスク新規作成", href: "/projects/addtasks" },
        { label: "ダッシュボード", href: "/projects/dashboard" },
        { label: "ユーザー管理", href: "/projects/usermanagement" },
    ];

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b"></header>

            <main className="w-full max-w-[1100px] mx-auto px-4 py-6 flex flex-row gap-4">
                    <div className="w-[20%] px-4 py-3 border-r-2 border-gray-300">
                        <nav>
                            <ul className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <li key={link.href} className="w-full">
                                        <Link
                                            href={link.href}
                                            className="block w-full text-base text-black p-4 rounded-md hover:bg-blue-200 hover:border-l-2 border-blue-500 transition-colors" 
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                    <div className="w-[80%]">{children}</div>
            </main>
        </div>
    );
}
