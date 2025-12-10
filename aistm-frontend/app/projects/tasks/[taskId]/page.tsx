import React from "react";

export default function page({ params }: { params: { taskId: string } }) {
    // このページ自体は空にしておき、layout.tsx の TaskDetails が表示を担当します。
    return <div />;
}
