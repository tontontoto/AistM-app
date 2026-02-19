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
        <div className="w-full">
            <label htmlFor={id || textarea_title} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {textarea_title}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea 
                className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 resize-y" 
                id={id || textarea_title} 
                rows={5}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}
