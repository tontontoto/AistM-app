"use client";

import React, { useState } from "react";
import AddButton from "./addButton";

export default function Input({
    input_title,
    input_id,
    input_type,
    input_pattern,
}: {
    input_title: string;
    input_id: string;
    input_type: string;
    input_pattern: string;
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
            <div>
                <label htmlFor={input_id}>{input_title}</label>
                <input type={input_type} id={input_id} className="border m-2"/>
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
