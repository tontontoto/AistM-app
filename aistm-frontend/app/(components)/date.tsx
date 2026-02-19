import React from 'react'

export default function Date({
    label = "期限",
    id,
    value,
    onChange,
    required,
}: {
    label?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) {
  return (
    <div className="w-full">
        <label htmlFor={id || "date"} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input 
            type="date" 
            id={id || "date"} 
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
  )
}
