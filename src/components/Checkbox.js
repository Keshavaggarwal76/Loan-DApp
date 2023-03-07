import React from "react"

export default function Checkbox({ label, value, onChange }) {
    return (
        <label>
            <input type="checkbox" checked={value} onChange={onChange} className="m-3" />
            {label}
        </label>
    )
}
