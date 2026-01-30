/**
 * Aurora Theme - Modern Gradient Color System
 * Vibrant, energetic color palette with gradient accents
 */

export const auroraTheme = {
    // Primary Gradients
    primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
    secondary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', // Blue to Violet

    // Category Gradients
    dream: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)', // Pink to Orange
    target: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', // Blue to Cyan
    safe: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', // Green to Teal

    // Background Gradients
    pageBg: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    cardBg: '#ffffff',

    // Solid Colors
    colors: {
        // Primary
        indigo: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
        },
        purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
        },

        // Categories
        pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            500: '#ec4899',
            600: '#db2777',
        },
        blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#2563eb',
        },
        green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#10b981',
            600: '#059669',
        },

        // Neutrals
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },
    },

    // Icon Colors (for badges)
    iconColors: {
        dream: '#ec4899',
        target: '#3b82f6',
        safe: '#10b981',
        tasks: '#8b5cf6',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
    },

    // Card Styles
    card: {
        default: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
        },
        hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        },
    },

    // Button Styles
    button: {
        primary: {
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        secondary: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
    },
};

export default auroraTheme;
