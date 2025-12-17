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
    <div className="flex flex-col my-2">
        <label htmlFor={id || "date"}>日付選択</label>
        <input 
            type="date" 
            id={id || "date"} 
            className="border"
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
  )
}
