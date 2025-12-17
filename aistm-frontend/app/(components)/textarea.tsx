import React from "react";

export default function Textarea({
    textarea_title,
    id,
    value,
    onChange,
    required,
}: {
    textarea_title: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={id || textarea_title}>{textarea_title}</label>
            <textarea 
                className="border w-full" 
                id={id || textarea_title} 
                rows={5}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}
