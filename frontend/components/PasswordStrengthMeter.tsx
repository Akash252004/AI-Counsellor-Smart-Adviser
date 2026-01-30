import React from 'react';

const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getStrength(password);

    const getLabel = () => {
        if (password.length === 0) return '';
        if (password.length < 8) return 'Too Short';
        if (strength < 3) return 'Weak'; // 8 chars but missing partial Requirements
        if (strength === 3) return 'Medium'; // 8 chars + Upper + Number (My Requirement)
        if (strength >= 4) return 'Strong'; // Bonus special char
        return 'Weak';
    };

    // Mapping my specific validation (8 + Upper + Number) to "Medium"
    // Actually, let's simplify logic to match user Request:
    // User: "Easy Medium Hard", "Must reach Medium"

    // My Rule: 1 Upper, 1 Number, 8 Chars.
    // Let's call meeting this rule "Medium".
    // Anything less is "Easy" (Weak).
    // Anything more (Special char) is "Hard" (Strong).

    const isValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    const isStrong = isValid && /[^A-Za-z0-9]/.test(password);

    let label = 'Weak';
    let color = '#ef4444'; // Red
    let width = '33%';

    if (password.length === 0) {
        return null;
    }

    if (!isValid) {
        label = 'Weak';
        color = '#ef4444';
        width = '33%';
    } else if (isStrong) {
        label = 'Strong';
        color = '#22c55e'; // Green
        width = '100%';
    } else {
        label = 'Medium';
        color = '#eab308'; // Yellow
        width = '66%';
    }

    return (
        <div style={{ marginTop: '8px' }}>
            <div style={{
                height: '4px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: width,
                    height: '100%',
                    backgroundColor: color,
                    transition: 'all 0.3s ease'
                }} />
            </div>
            <p style={{
                fontSize: '12px',
                color: color,
                marginTop: '4px',
                textAlign: 'right',
                fontWeight: '600'
            }}>
                {label}
            </p>
        </div>
    );
};

export default PasswordStrengthMeter;
