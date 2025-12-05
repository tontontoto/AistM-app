import React from "react";
import Input from "../(components)/input";
import Button from "../(components)/button";

    export default function page() {
    return (
        <div className="bg-amber-50 w-[80%] items-center mx-auto">
            <h2>アカウント登録ページ</h2>
            <form action="">
                <Input input_title="メールアドレス" input_id="email" input_type="email" />
                <Input input_title="パスワード" input_id="password" input_type="password" />
                <Button button_type="submit" />
            </form>
        </div>
    );
}
