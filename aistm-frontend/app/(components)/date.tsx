import React from 'react'

export default function Date() {
  return (
    <div className="flex flex-col my-2">
        <label htmlFor="date">日付選択</label>
        <input type="date" id="date" className="border" />
    </div>
  )
}
