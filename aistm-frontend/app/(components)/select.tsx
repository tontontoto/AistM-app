import React, { useMemo } from "react";

export default function Select({
    select_title,
    select_name,
    select_id,
    options = [],
    value,
    onChange,
    required,
    isPriority = false,
}: {
    select_title: string;
    select_name: string;
    select_id: string;
    options?: { value: string; label: string }[];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    isPriority?: boolean;
}) {
    // 優先度に応じた色を取得
    const getPriorityColor = (priorityName: string) => {
        switch (priorityName) {
            case '低':
                return {
                    border: 'border-blue-300',
                    bg: 'bg-blue-50',
                    text: 'text-blue-800',
                    focusRing: 'focus:ring-blue-500 focus:border-blue-500'
                };
            case '中':
                return {
                    border: 'border-yellow-300',
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-800',
                    focusRing: 'focus:ring-yellow-500 focus:border-yellow-500'
                };
            case '高':
                return {
                    border: 'border-orange-400',
                    bg: 'bg-orange-50',
                    text: 'text-orange-900',
                    focusRing: 'focus:ring-orange-500 focus:border-orange-500'
                };
            case '緊急':
                return {
                    border: 'border-red-400',
                    bg: 'bg-red-50',
                    text: 'text-red-900',
                    focusRing: 'focus:ring-red-500 focus:border-red-500'
                };
            default:
                return {
                    border: 'border-gray-300',
                    bg: 'bg-white',
                    text: 'text-gray-800',
                    focusRing: 'focus:ring-gray-500 focus:border-gray-500'
                };
        }
    };

    // 選択された優先度の色を取得
    const selectedPriority = useMemo(() => {
        if (!isPriority || !value) return null;
        const selectedOption = options.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : null;
    }, [isPriority, value, options]);

    const priorityColor = selectedPriority ? getPriorityColor(selectedPriority) : {
        border: 'border-gray-300',
        bg: 'bg-white',
        text: 'text-gray-800',
        focusRing: 'focus:ring-gray-500 focus:border-gray-500'
    };

    return (
        <div className="w-full">
            <label htmlFor={select_id} className="block text-sm font-medium text-gray-700 mb-2">
                {select_title}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <select 
                    name={select_name} 
                    id={select_id} 
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer pr-10 ${
                        isPriority && selectedPriority 
                            ? `${priorityColor.border} ${priorityColor.bg} ${priorityColor.text} ${priorityColor.focusRing}`
                            : 'border-gray-300 bg-white text-gray-800 focus:ring-gray-500 focus:border-gray-500'
                    }`}
                    value={value}
                    onChange={onChange}
                    required={required}
                >
                    <option value="">--1 つ選択してください--</option>
                    {options.map((opt) => {
                        const optColor = isPriority ? getPriorityColor(opt.label) : null;
                        return (
                            <option 
                                key={opt.value} 
                                value={opt.value}
                                className={optColor ? `${optColor.bg} ${optColor.text}` : ''}
                            >
                                {opt.label}
                            </option>
                        );
                    })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className={`w-5 h-5 ${
                        isPriority && selectedPriority 
                            ? selectedPriority === '低' ? 'text-blue-600' 
                            : selectedPriority === '中' ? 'text-yellow-600'
                            : selectedPriority === '高' ? 'text-orange-600'
                            : selectedPriority === '緊急' ? 'text-red-600'
                            : 'text-gray-600'
                            : 'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
}
