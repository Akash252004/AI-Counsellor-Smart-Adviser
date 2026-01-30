'use client';

import React, { useEffect } from 'react';
import { auroraTheme } from '@/lib/theme';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const styles = {
    toast: {
        position: 'fixed' as const,
        bottom: '24px',
        right: '24px',
        backgroundColor: '#1f2937', // Dark gray
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        minWidth: '300px',
        justifyContent: 'space-between',
    },
    message: {
        fontSize: '14px',
        fontWeight: '500',
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        color: '#9ca3af',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div style={styles.toast}>
            <span style={styles.message}>{message}</span>
            <button style={styles.closeButton} onClick={onClose}>
                ✕
            </button>
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
