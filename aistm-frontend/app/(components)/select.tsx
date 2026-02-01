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
    isStatus = false,
}: {
    select_title: string;
    select_name: string;
    select_id: string;
    options?: { value: string; label: string }[];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    isPriority?: boolean;
    isStatus?: boolean;
}) {
    // ステータスに応じた色を取得（ダッシュボードと統一）
    const getStatusColor = (statusName: string) => {
        switch (statusName) {
            case '企画中':
                return {
                    border: 'border-purple-300',
                    bg: 'bg-purple-100',
                    text: 'text-purple-800',
                    focusRing: 'focus:ring-purple-500 focus:border-purple-500'
                };
            case '進行中':
                return {
                    border: 'border-blue-300',
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    focusRing: 'focus:ring-blue-500 focus:border-blue-500'
                };
            case '完了':
                return {
                    border: 'border-green-300',
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    focusRing: 'focus:ring-green-500 focus:border-green-500'
                };
            case '保留中':
                return {
                    border: 'border-gray-300',
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    focusRing: 'focus:ring-gray-500 focus:border-gray-500'
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

    // 選択されたステータスの色を取得
    const selectedStatus = useMemo(() => {
        if (!isStatus || !value) return null;
        const selectedOption = options.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : null;
    }, [isStatus, value, options]);

    const priorityColor = selectedPriority ? getPriorityColor(selectedPriority) : {
        border: 'border-gray-300',
        bg: 'bg-white',
        text: 'text-gray-800',
        focusRing: 'focus:ring-gray-500 focus:border-gray-500'
    };

    const statusColor = selectedStatus ? getStatusColor(selectedStatus) : {
        border: 'border-gray-300',
        bg: 'bg-white',
        text: 'text-gray-800',
        focusRing: 'focus:ring-gray-500 focus:border-gray-500'
    };

    // どの色スタイルを使用するか決定
    const getSelectStyle = () => {
        if (isPriority && selectedPriority) {
            return `${priorityColor.border} ${priorityColor.bg} ${priorityColor.text} ${priorityColor.focusRing}`;
        }
        if (isStatus && selectedStatus) {
            return `${statusColor.border} ${statusColor.bg} ${statusColor.text} ${statusColor.focusRing}`;
        }
        return 'border-gray-300 bg-white text-gray-800 focus:ring-gray-500 focus:border-gray-500';
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
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer pr-10 ${getSelectStyle()}`}
                    value={value}
                    onChange={onChange}
                    required={required}
                >
                    <option value="">--1 つ選択してください--</option>
                    {options.map((opt) => {
                        const optColor = isPriority ? getPriorityColor(opt.label) : isStatus ? getStatusColor(opt.label) : null;
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
                        : isStatus && selectedStatus
                            ? selectedStatus === '企画中' ? 'text-purple-600'
                            : selectedStatus === '進行中' ? 'text-blue-600'
                            : selectedStatus === '完了' ? 'text-green-600'
                            : selectedStatus === '保留中' ? 'text-gray-600'
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
