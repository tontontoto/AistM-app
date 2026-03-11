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
        { label: "タスク新規作成", href: "/projects/addtasks" },
        { label: "ダッシュボード", href: "/projects/dashboard" },
        { label: "PMダッシュボード", href: "/projects/pm-dashboard" },
        { label: "ユーザー管理", href: "/projects/usermanagement" },
    ];

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b"></header>

            {/* ハンバーガーメニュー（モバイル用） */}
            <HamburgerMenu links={navLinks} />

            <main className="w-full max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-4">
                    {/* デスクトップ用サイドナビゲーション */}
                    <div className="hidden lg:block lg:w-[20%] px-4 py-3 border-r-2 border-gray-300">
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
                                                        : "text-black hover:bg-blue-200 hover:border-l-2 border-blue-500"
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
                    <div className="w-full lg:w-[80%]">{children}</div>
            </main>
        </div>
    );
}
