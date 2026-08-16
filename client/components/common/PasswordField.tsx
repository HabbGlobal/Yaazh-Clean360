"use client";

import { useState } from "react";

interface PasswordFieldProps {
  name: string;
  autoComplete: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

export default function PasswordField({ name, autoComplete, placeholder, required, minLength, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 6.5 10 6.5a18.4 18.4 0 0 1-3.2 4M6.3 6.3A18 18 0 0 0 2 11.5S5.5 18 12 18a9.7 9.7 0 0 0 4.7-1.2" /><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
        )}
      </button>
    </span>
  );
}