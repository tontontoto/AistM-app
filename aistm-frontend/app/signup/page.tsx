import React from "react";
import Input from "../(components)/input";
import Button from "../(components)/button";

export default function page() {
    return (
        <div className="bg-amber-50 w-[80%] items-center mx-auto">
            <h2>アカウント登録ページ</h2>
            <form action="">
                <Input
                    input_title="メールアドレス"
                    input_id="email"
                    input_type="email"
                    input_pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                />
                <Input
                    input_title="パスワード"
                    input_id="password"
                    input_type="password"
                    input_pattern=""
                />
                <Button button_type="submit" button_title="登録" />
            </form>
        </div>
    );
}
