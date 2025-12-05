import React from "react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full py-4 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-row">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                <a href="/">AistM 作業管理ツール</a>
            </h1>
            <Link href="../" className="text-2xl"> &lt;仮の戻るボタン&gt;</Link>
        </header>
    );
}
