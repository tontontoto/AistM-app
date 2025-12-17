"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./(components)/button";

export default function Home() {
  const router = useRouter();

  const quickLogin = () => {
    document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7日
    router.push("/projects");
  };

  const quickLogout = () => {
    document.cookie = "auth=; Path=/; Max-Age=0";
    router.push("/");
  };
  // const isFirstRender = false;
  // if (!isFirstRender) {
  //   redirect("/projects");
  // }

  return (
    <div>
      <h1>AistM 作業管理ツール</h1>

      <div className="w-50% items-center flex flex-col mx-auto gap-2">
        <p className="font-bold">リンクショートカット</p>
        <Link href="/signup">サインアップ</Link>
        <Link href="/login">ログイン</Link>
        <Link href="/projects">プロジェクト管理</Link>
        <Link href="/projects/addproject">プロジェクト追加</Link>
        <Link href="/user/profile">ユーザープロフィール</Link>
        <div className="mt-4">
          <Button button_type="button" button_title="簡易ログイン" onClick={quickLogin} />
          <div className="mt-2">
            <Button button_type="button" button_title="簡易ログアウト" onClick={quickLogout} />
          </div>
        </div>
      </div>
    </div>
  );
}
