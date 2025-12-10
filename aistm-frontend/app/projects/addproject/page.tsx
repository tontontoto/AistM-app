import React from "react";
import Input from "../../(components)/input";
import Button from "../../(components)/button";
import Select from "../../(components)/select";
import Textarea from "../../(components)/textarea";
import Date from "../../(components)/date";

// プロジェクトステータスの選択肢リスト
const projectStatusList = [
    { value: "planning", label: "企画中" },
    { value: "in_progress", label: "進行中" },
    { value: "completed", label: "完了" },
    { value: "on_hold", label: "保留中" },
];

const projectPriorityList = [
    { value: "lowest", label: "最低" },
    { value: "low", label: "低" },
    { value: "medium", label: "中" },
    { value: "high", label: "高" },
    { value: "highest", label: "最重要" },
];

// 仮担当者のデータ
const membersList = [
    { value: "user1", label: "山田太郎" },
    { value: "user2", label: "鈴木花子" },
    { value: "user3", label: "佐藤次郎" },
];

export default function page() {
    return (
        <div>
            <h2>プロジェクト追加画面</h2>
            <div className="w-[50%] mx-auto bg-gray-200 shadow-2xl rounded-xl p-4">
                <form>
                    <Input
                        input_title="プロジェクト名"
                        input_id="project_name"
                        input_type="text"
                        input_pattern={""}
                    ></Input>
                    <Input
                        input_title="プロジェクト概要"
                        input_id="project_overview"
                        input_type="text"
                        input_pattern={""}
                    ></Input>
                    <Select
                        select_title="プロジェクトステータス"
                        select_name="project_status"
                        select_id="project_status"
                        options={projectStatusList}
                    ></Select>
                    <Select
                        select_title="プロジェクト優先度"
                        select_name="project_priority"
                        select_id="project_priority"
                        options={projectPriorityList}
                    ></Select>
                    <Textarea textarea_title="プロジェクトの説明"></Textarea>
                    <Select
                        select_title="担当者"
                        select_name="project_member"
                        select_id="project_member"
                        options={membersList}
                    ></Select>
                    <Date />
                    <Input
                        input_title="関連リンク"
                        input_id="related_link"
                        input_type="url"
                        input_pattern="https://.*"
                    ></Input>
                    <Button button_type="submit" button_title="作成" />
                </form>
            </div>
        </div>
    );
}
