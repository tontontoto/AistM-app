import React from "react";
import Link from "next/link";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navLinks = [
        { label: "プロジェクト一覧", href: "/projects" },
        { label: "プロジェクト新規作成", href: "/projects/addproject" },
        { label: "タスク一覧", href: "/projects/tasks" },
        { label: "タスク新規作成", href: "/projects/addtasks" },
    ];

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b"></header>

            <main className="w-full mx-auto px-4 py-6 flex flex-row gap-4">
                    <div className="w-[20%] px-4 py-3 border-r-2 border-gray-300">
                        <nav className="h-[1000vh]">
                            <ul className="flex flex-col gap-4 items-center">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-blue-600 hover:underline"
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
