import React from 'react'

export default function Button({ button_type }: { button_type: "button" | "submit" | "reset" }) {
    return (
        <div>
            <button 
                type={button_type}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                送信
            </button>
        </div>
    )
}
