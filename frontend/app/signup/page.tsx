'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import PasswordInput from '@/components/PasswordInput';

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
    // Success modal
    modal: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center' as const,
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    modalIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
        marginBottom: '12px',
    },
    modalText: {
        fontSize: '15px',
        color: auroraTheme.colors.gray[600],
        marginBottom: '24px',
    },
};

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showSuccessModal && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [showSuccessModal, timer]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must contain at least 8 characters, one uppercase letter, and one number.');
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await authHelpers.signUp(email, password, name);

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
            } else {
                // Show success modal and start timer
                setShowSuccessModal(true);
                setTimer(60);
                setCanResend(false);
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setResendLoading(true);
        try {
            const { error } = await authHelpers.resendVerificationEmail(email);
            if (error) {
                setResendMessage('Failed to resend. Please try again.');
            } else {
                setResendMessage('Verification email sent again!');
                // Reset timer (optional, but good UX to prevent spam)
                setTimer(60);
                setCanResend(false);
            }
        } catch (err) {
            setResendMessage('An unexpected error occurred.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo}>🎓</div>
                        <h1 style={styles.title}>Create Account</h1>
                        <p style={styles.subtitle}>Start your study abroad journey</p>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form style={styles.form} onSubmit={handleSignup}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                style={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                suppressHydrationWarning
                            />
                        </div>

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
                            <PasswordInput
                                placeholder="Minimum 8 characters"
                                style={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <PasswordStrengthMeter password={password} />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <PasswordInput
                                placeholder="Re-enter password"
                                style={styles.input}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {}),
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
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
                            Sign up with Google
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Already have an account?{' '}
                        <Link href="/login" style={styles.link}>
                            Sign in
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

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalIcon}>📧</div>
                        <h2 style={styles.modalTitle}>Check Your Email</h2>
                        <p style={styles.modalText}>
                            We've sent a verification link to <strong>{email}</strong>.<br />
                            Please verify your email before logging in.
                        </p>

                        {/* Timer / Resend Logic */}
                        <div style={{ marginBottom: '20px', fontSize: '14px', color: auroraTheme.colors.gray[500] }}>
                            {!canResend ? (
                                <p>You can resend the email in <span style={{ fontWeight: 'bold', color: auroraTheme.colors.indigo[600] }}>{timer}s</span></p>
                            ) : (
                                <button
                                    onClick={handleResendEmail}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: auroraTheme.colors.indigo[600],
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontSize: '15px'
                                    }}
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            )}
                        </div>

                        {resendMessage && (
                            <div style={{
                                marginBottom: '16px',
                                fontSize: '13px',
                                color: resendMessage.includes('Failed') ? '#dc2626' : '#16a34a'
                            }}>
                                {resendMessage}
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                Already verified?
                            </p>
                            <Link
                                href="/login"
                                style={{
                                    ...styles.button,
                                    display: 'inline-block',
                                    textDecoration: 'none',
                                    marginTop: '0',
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    background: 'white',
                                    color: auroraTheme.colors.indigo[600],
                                    border: '1px solid ' + auroraTheme.colors.indigo[100]
                                }}
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

