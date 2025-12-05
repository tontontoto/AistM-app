import React from "react";

export default function Input({ input_title, input_id, input_type }: { input_title: string; input_id: string; input_type: string }) {
    return (
        <div>
            <label htmlFor={input_id}>{input_title}</label>
            <input type={input_type} id={input_id} className="border" />
        </div>
    );
}
