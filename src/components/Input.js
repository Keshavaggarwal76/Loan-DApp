import React from "react"

// A functional component to render an input field with optional props
export default function Input({
    onChange,
    id,
    name,
    inputs,
    type,
    pattern,
    maxLength,
    required,
    placeholder,
}) {
    return (
        <div className="m-1">
            <input
                style={{
                    // color: "rgb(209, 205, 199)",
                    // backgroundColor: "rgb(24, 26, 27)",
                    // borderColor: "rgb(60, 65, 68)",
                    backgroundColor: "#F8F8F6",
                    borderColor: "transparent",
                    fontSize: "16px",
                    width: "170px",
                }}
                type={type}
                onChange={onChange}
                placeholder={placeholder}
                value={inputs[name]}
                name={name}
                className="form-control"
                required={required}
                id={id}
                pattern={pattern}
                maxLength={maxLength}
            />
        </div>
    )
}
