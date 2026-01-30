'use client';

import { useState } from 'react';
import { auroraTheme } from '@/lib/theme';

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    required?: boolean;
    minLength?: number;
    name?: string;
}

const PasswordInput = ({ value, onChange, placeholder, style, required, minLength, name }: PasswordInputProps) => {
    const [show, setShow] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    ...style,
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingRight: '40px' // Make room for the eye icon
                }}
                required={required}
                minLength={minLength}
                name={name}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: auroraTheme.colors.gray[500],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    zIndex: 2
                }}
                title={show ? "Hide password" : "Show password"}
            >
                {show ? '👁️' : '🔒'}
            </button>
        </div>
    );
};

export default PasswordInput;
// Note: Using 🔒 for "Hidden" state (or generic closed eye if available in unicode as 🙈 or similar, but 🔒 signifies secure/hidden well enough, or just use 👁️ vs 🚫👁️ )
// Actually, standard is Eye (Open) vs Eye-Slash (Closed).
// Unicode: 👁️ (1F441)
// Closed/Slash: 🙈 (See-No-Evil) or just change opacity.
// Let's use 👁️ for "Show" (when logic is hidden) or...
// Wait, usually icon indicates *current state* or *action*?
// If hidden, show "Eye" (Click to view).
// If shown, show "SlashEye" (Click to hide).
// 👁️ = visible.
// Let's use text icons for simplicity or SVG if possible.
// For this MVP, I'll use 👁️ (Click to Hide) and 🙈 (Click to Show) or similar.
// Better:
// Show: 👁️
// Hide: 🚫
