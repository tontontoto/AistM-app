"use client";

import React, { useState } from "react";
import AddButton from "./addButton";

export default function Input({
    input_title,
    input_id,
    input_type,
    input_pattern,
    input_name,
    value,
    required,
    placeholder,
    onChange,
    onBlur,
    className,
}: {
    input_title: string;
    input_id: string;
    input_type: string;
    input_pattern: string;
    input_name?: string;
    value?: string;
    required?: boolean;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    className?: string;
}) {
    const [values, setValues] = useState<string[]>([""]);

    const addInput = () => {
        setValues((v) => [...v, ""]);
    };

    const updateValue = (index: number, val: string) => {
        setValues((prev) => {
            const copy = [...prev];
            copy[index] = val;
            return copy;
        });
    };

    if (input_pattern === "" || input_type !== "text") {
        return (
            <div className="w-full">
                {input_title && (
                    <label htmlFor={input_id} className="block text-sm font-medium text-gray-700 mb-2">
                        {input_title}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    type={input_type}
                    id={input_id}
                    name={input_name || input_id}
                    pattern={input_pattern || undefined}
                    className={className || "w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-800 placeholder-gray-400"}
                    value={value ?? undefined}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    onBlur={onBlur}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col my-2">
            <label htmlFor={input_id}>{input_title}</label>
            <div className="flex flex-col gap-2">
                {values.map((val, idx) => (
                    <div className="flex flex-row items-center" key={idx}>
                        <span className="mr-2">・</span>
                        <input
                            type={input_type}
                            id={`${input_id}-${idx}`}
                            pattern={input_pattern || undefined}
                            className="border m-2"
                            value={val}
                            onChange={(e) => updateValue(idx, e.target.value)}
                            onBlur={onBlur}
                        />
                        {idx === values.length - 1 && (
                            <AddButton onClick={addInput} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
