"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
    label: string;
    href: string;
};

type HamburgerMenuProps = {
    links: NavLink[];
};

export default function HamburgerMenu({ links }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // メニューが開いている時はスクロールを無効化
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // ルート変更時にメニューを閉じる
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* ハンバーガーボタン */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-colors"
                aria-label="メニュー"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span
                        className={`block h-0.5 w-full bg-gray-800 transition-all duration-300 ${
                            isOpen ? "rotate-45 translate-y-2" : ""
                        }`}
                    ></span>
                    <span
                        className={`block h-0.5 w-full bg-gray-800 transition-all duration-300 ${
                            isOpen ? "opacity-0" : ""
                        }`}
                    ></span>
                    <span
                        className={`block h-0.5 w-full bg-gray-800 transition-all duration-300 ${
                            isOpen ? "-rotate-45 -translate-y-2" : ""
                        }`}
                    ></span>
                </div>
            </button>

            {/* オーバーレイ */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* サイドメニュー */}
            <nav
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">メニュー</h2>
                    <ul className="flex flex-col gap-2">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`block w-full text-base px-4 py-3 rounded-md transition-colors ${
                                            isActive
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-700 hover:bg-blue-100"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </>
    );
}
