'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import { auroraTheme } from '@/lib/theme';

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        padding: '20px',
    },
    container: {
        width: '100%',
        maxWidth: '440px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '40px',
    },
    logo: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '15px',
        color: auroraTheme.colors.gray[600],
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[700],
    },
    input: {
        padding: '14px 16px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
    },
    inputFocus: {
        borderColor: auroraTheme.colors.indigo[500],
    },
    button: {
        padding: '16px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    error: {
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        color: '#dc2626',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    success: {
        padding: '12px 16px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '10px',
        color: '#16a34a',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    footer: {
        marginTop: '24px',
        textAlign: 'center' as const,
        fontSize: '14px',
        color: auroraTheme.colors.gray[600],
    },
    link: {
        color: auroraTheme.colors.indigo[600],
        fontWeight: '600',
        textDecoration: 'none',
    },
};

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await authHelpers.signIn(email, password);

            if (signInError) {
                // Check if account doesn't exist (optional: Supabase might not differentiate for security)
                // But generally, we should NOT redirect on "Invalid login credentials"
                if (signInError.message.includes('User not found')) {
                    // Only redirect if explicitly "User not found" (rare with Supabase default settings)
                    setError('Account not found. Redirecting to signup...');
                    setTimeout(() => router.push('/signup'), 2000);
                    return;
                }

                if (signInError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.');
                    return;
                }

                setError(signInError.message);
            } else {
                // Successful login - Check profile status to route correctly
                try {
                    // We need to wait a tiny bit for the session to be available for the API interceptor? 
                    // Usually awaiting signIn is enough.
                    const profileResponse = await apiClient.getProfile();

                    if (profileResponse.data && profileResponse.data.exists) {
                        router.push('/dashboard');
                    } else {
                        // No profile found -> New user -> Onboarding
                        router.push('/onboarding');
                    }
                } catch (profileErr) {
                    console.error('Error checking profile:', profileErr);
                    // Fallback to dashboard if check fails
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo}>🎓</div>
                        <h1 style={styles.title}>Welcome Back</h1>
                        <p style={styles.subtitle}>Sign in to continue your journey</p>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form style={styles.form} onSubmit={handleLogin}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                placeholder="your.email@example.com"
                                style={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                style={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '12px' }}>
                            <Link
                                href="/forgot-password"
                                style={{
                                    color: auroraTheme.colors.indigo[600],
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {}),
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                            <span style={{ padding: '0 10px', fontSize: '13px', color: '#6b7280' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => authHelpers.signInWithGoogle()}
                            style={{
                                ...styles.button,
                                background: '#ffffff',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '0',
                            }}
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />
                            Sign in with Google
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Don't have an account?{' '}
                        <Link href="/signup" style={styles.link}>
                            Create one
                        </Link>
                    </div>
                </div>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center' as const,
                }}>
                    <Link
                        href="/"
                        style={{
                            color: '#ffffff',
                            fontSize: '14px',
                            textDecoration: 'none',
                            opacity: 0.9,
                        }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
