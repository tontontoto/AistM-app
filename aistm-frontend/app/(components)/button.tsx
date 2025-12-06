import React from 'react'

export default function Button({ button_type, button_title }: { button_type: "button" | "submit" | "reset", button_title: string }) {
    return (
        <div>
            <button 
                type={button_type}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {button_title}
            </button>
        </div>
    )
}
