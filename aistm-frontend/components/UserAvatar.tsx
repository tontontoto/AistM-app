import React from "react";

type UserAvatarProps = {
    name?: string;
    username?: string;
    email?: string;
    avatarColor?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-20 h-20 text-2xl",
    xl: "w-28 h-28 text-4xl",
};

export default function UserAvatar({
    name,
    username,
    email,
    avatarColor = "#3B82F6",
    size = "md",
    className = "",
}: UserAvatarProps) {
    const initial = (
        name?.trim().charAt(0) ||
        username?.trim().charAt(0) ||
        email?.trim().charAt(0) ||
        "U"
    ).toUpperCase();
    const sizeClass = sizeMap[size];

    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold ${className}`}
            style={{ backgroundColor: avatarColor }}
        >
            {initial}
        </div>
    );
}
