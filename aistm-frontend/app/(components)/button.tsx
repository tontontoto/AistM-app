import React from 'react'

export default function Button({ button_type, button_title, disabled, onClick }: { button_type: "button" | "submit" | "reset", button_title: string, disabled?: boolean, onClick?: () => void }) {
    return (
        <div>
            <button 
                type={button_type}
                disabled={disabled}
                onClick={onClick}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded">
                {button_title}
            </button>
        </div>
    )
}
