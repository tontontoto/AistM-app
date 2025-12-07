import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Home() {
  // const isFirstRender = false;
  // if (!isFirstRender) {
  //   redirect("/projects");
  // }

  return (
    <div>
      <h1>AistM 作業管理ツール</h1>

      <div className="w-50% items-center flex flex-col mx-auto">
        <p className="font-bold">リンクショートカット</p>
        <Link href="/signup">サインアップ</Link>
        <Link href="/login">ログイン</Link>
        <Link href="/projects">プロジェクト管理</Link>
        <Link href="/projects/addproject">プロジェクト追加</Link>
        <Link href="/user/profile">ユーザープロフィール</Link>
      </div>
    </div>
  );
}
