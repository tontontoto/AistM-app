"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./(components)/button";

export default function Home() {
  const router = useRouter();

  const quickLogin = async () => {
    // 簡易ログイン: 最初のユーザーを取得してログイン
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/";
      const base = apiBase.replace(/\/+$/, "");
      const response = await fetch(`${base}/master/users`);
      if (response.ok) {
        const users = await response.json().catch(() => []);
        if (users.length > 0) {
          const firstUser = users[0];
          document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
          document.cookie = `user_id=${firstUser.id}; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
          router.push("/projects");
          return;
        }
      }
    } catch (err) {
      console.error("簡易ログインエラー:", err);
    }
    // フォールバック: ユーザーIDなしでログイン
    document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
    router.push("/projects");
  };

  const quickLogout = () => {
    document.cookie = "auth=; Path=/; Max-Age=0";
    document.cookie = "user_id=; Path=/; Max-Age=0";
    router.push("/");
  };
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
            <div className="border-t border-gray-200 pt-6 flex flex-col gap-3">
              <Button button_type="button" button_title="簡易ログイン" onClick={quickLogin} />
              <Button button_type="button" button_title="簡易ログアウト" onClick={quickLogout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
