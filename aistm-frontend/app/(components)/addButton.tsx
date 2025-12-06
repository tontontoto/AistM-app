"use client"

import React from "react";

export default function AddButton({ onClick }: { onClick?: () => void }) {
    return (
        <div className="px-4">
            <button type="button" onClick={onClick} className="bg-blue-500 text-white rounded">
                +
            </button>
        </div>
    );
}
