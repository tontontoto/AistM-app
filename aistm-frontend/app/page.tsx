"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // const isFirstRender = false;
  // if (!isFirstRender) {
  //   redirect("/projects");
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">AistM</h1>
          <p className="text-xl text-gray-600 mb-2">作業管理ツール</p>
          <p className="text-gray-500">プロジェクトとタスクを効率的に管理</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">クイックアクセス</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Link 
                href="/signup"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
              >
                <span className="text-blue-600 font-semibold">サインアップ</span>
              </Link>
              <Link 
                href="/login"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
              >
                <span className="text-blue-600 font-semibold">ログイン</span>
              </Link>
              <Link 
                href="/projects"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
              >
                <span className="text-blue-600 font-semibold">プロジェクト管理</span>
              </Link>
              <Link 
                href="/projects/tasks"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
              >
                <span className="text-blue-600 font-semibold">タスク管理</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
