import React from "react";

type Props = {
    selectedId?: string | number | null
}

// タスクの詳細情報コンポーネント
export default function TaskDetails({ selectedId }: Props) {
    return (
        <div className="p-10 flex flex-col gap-4 border border-gray-400 rounded-3xl bg-white">
            <p className="text-sm text-gray-500">タスクの詳細情報</p>
            <p className="text-red-600">選択されたID: {selectedId ?? "未選択"}(debug)</p>
            <h3 className="font-bold">[タスクタイトル]</h3>
            <p>親プロジェクトのタイトルがここに入ります。project1</p>
            <p>ステータス</p>
            <p>説明</p>
            <p>説明の内容がここにはいる</p>
            <p className="mt-4 font-bold">詳細</p>
            <p>担当者: 田中太郎</p>
            <p>優先度</p>
            <p>期限</p>
            <p>作業関連リンク</p>
        </div>
    );
}
