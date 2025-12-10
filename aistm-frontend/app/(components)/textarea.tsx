import React from "react";

export default function Textarea({
    textarea_title,
}: {
    textarea_title: string;
}) {
    return (
        <div>
            <label htmlFor={textarea_title}>{textarea_title}</label>
            <textarea className="border w-full" id={textarea_title} rows={5} />
        </div>
    );
}
