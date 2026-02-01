import React from 'react'

export default function Date({
    id,
    value,
    onChange,
    required,
}: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) {
  return (
    <div className="w-full">
        <label htmlFor={id || "date"} className="block text-sm font-medium text-gray-700 mb-2">
            日付選択
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input 
            type="date" 
            id={id || "date"} 
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-800"
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
  )
}
