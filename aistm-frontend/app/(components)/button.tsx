import React from "react";

type ButtonColor = "green" | "blue" | "gray" | "red";

type ButtonProps = {
    button_type: "button" | "submit" | "reset";
    button_title: string;
    disabled?: boolean;
    onClick?: () => void;
    color?: ButtonColor;
    className?: string;
};

const colorClasses: Record<ButtonColor, string> = {
    green: "bg-green-600 hover:bg-green-700 disabled:bg-green-300",
    blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300",
    gray: "bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400",
    red: "bg-red-600 hover:bg-red-700 disabled:bg-red-300",
};

export default function Button({
    button_type,
    button_title,
    disabled,
    onClick,
    color = "green",
    className,
}: ButtonProps) {
    return (
        <div>
            <button 
                type={button_type}
                disabled={disabled}
                onClick={onClick}
                className={[
                    colorClasses[color],
                    "disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {button_title}
            </button>
        </div>
    )
}
