"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HamburgerMenu from "../../components/HamburgerMenu";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const navLinks = [
        { label: "プロジェクト一覧", href: "/projects" },
        { label: "タスク一覧", href: "/projects/tasks" },
        { label: "ガントチャート", href: "/projects/gantt" },
        // { label: "タスク新規作成", href: "/projects/addtasks" },
        { label: "ダッシュボード", href: "/projects/dashboard" },
        { label: "PMダッシュボード", href: "/projects/pm-dashboard" },
        { label: "ユーザー管理", href: "/projects/usermanagement" },
    ];

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"></header>

            {/* ハンバーガーメニュー（モバイル用） */}
            <HamburgerMenu links={navLinks} />

            <main className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-4">
                    {/* デスクトップ用サイドナビゲーション */}
                    <div className="hidden lg:block lg:w-64 shrink-0 px-4 py-3 border-r-2 border-gray-300 dark:border-gray-700">
                        <nav>
                            <ul className="flex flex-col gap-4">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <li key={link.href} className="w-full">
                                            <Link
                                                href={link.href}
                                                className={`block w-full text-base p-4 rounded-md transition-colors ${
                                                    isActive
                                                        ? "bg-blue-500 text-white"
                                                        : "text-black dark:text-white hover:bg-blue-200 dark:hover:bg-gray-800 hover:border-l-2 border-blue-500"
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                    <div className="w-full flex-1 min-w-0">{children}</div>
            </main>
        </div>
    );
}
