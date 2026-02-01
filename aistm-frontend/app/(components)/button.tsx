import React from 'react'

export default function Button({ button_type, button_title, disabled, onClick }: { button_type: "button" | "submit" | "reset", button_title: string, disabled?: boolean, onClick?: () => void }) {
    return (
        <div>
            <button 
                type={button_type}
                disabled={disabled}
                onClick={onClick}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2">
                {button_title}
            </button>
        </div>
    )
}
