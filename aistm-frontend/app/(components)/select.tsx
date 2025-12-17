import React from "react";

export default function Select({
    select_title,
    select_name,
    select_id,
    options = [],
    value,
    onChange,
    required,
}: {
    select_title: string;
    select_name: string;
    select_id: string;
    options?: { value: string; label: string }[];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col my-2">
            <label htmlFor={select_id}>{select_title}</label>
            <select 
                name={select_name} 
                id={select_id} 
                className="border"
                value={value}
                onChange={onChange}
                required={required}
            >
                <option value="">--1 つ選択してください--</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
