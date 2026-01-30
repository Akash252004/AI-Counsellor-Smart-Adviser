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
    link: {
        color: auroraTheme.colors.indigo[600],
        fontWeight: '600',
        textDecoration: 'none',
    },
    stepIndicator: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
        gap: '8px'
    },
    stepDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: auroraTheme.colors.gray[300],
        transition: 'all 0.3s ease'
    },
    stepDotActive: {
        backgroundColor: auroraTheme.colors.indigo[500],
        transform: 'scale(1.2)'
    }
};

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(40);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: otpError } = await authHelpers.signInWithOtp(email);
            if (otpError) {
                setError(otpError.message);
            } else {
                setStep(2);
                setTimer(40);
                setCanResend(false);
            }
        } catch (err: any) {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // signInWithOtp automatically logs user in if token matches magic link, 
            // but for OTP we use verifyOtp explicitly
            const { error: verifyError } = await authHelpers.verifyOtp(email, otp.trim());

            if (verifyError) {
                setError('Invalid OTP code. Please try again.');
            } else {
                // Session is now active
                setStep(3);
            }
        } catch (err: any) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setResendMessage('');
        try {
            const { error: otpError } = await authHelpers.signInWithOtp(email);
            if (otpError) {
                setResendMessage('Failed to resend code.');
            } else {
                setResendMessage('Code sent again!');
                setTimer(40);
                setCanResend(false);
            }
        } catch (err: any) {
            setResendMessage('An unexpected error occurred.');
        } finally {
            setResendLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must contain at least 8 characters, one uppercase letter, and one number.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await authHelpers.updateUser({ password });
            if (updateError) {
                setError(updateError.message);
            } else {
                // Success! Redirect to dashboard or login
                // User is already logged in from Step 2, so lets go to dashboard
                // or logout and ask to login cleanly?
                // Request implies: "confirm password... verifies... show he enter new password"
                // Let's redirect to Dashboard directly for better UX
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError('Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form style={styles.form} onSubmit={handleSendOtp}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                Enter your email address and we'll send you an 8-digit code to reset your password.
            </p>
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
            <button
                type="submit"
                style={{
                    ...styles.button,
                    ...(loading ? styles.buttonDisabled : {}),
                }}
                disabled={loading}
            >
                {loading ? 'Sending...' : 'Send OTP Code'}
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form style={styles.form} onSubmit={handleVerifyOtp}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                Enter the 8-digit code sent to <strong>{email}</strong>
            </p>
            <div style={styles.inputGroup}>
                <label style={styles.label}>8-Digit OTP</label>
                <input
                    type="text"
                    placeholder="12345678"
                    style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={8}
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
                {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: auroraTheme.colors.gray[600] }}>
                {!canResend ? (
                    <p>Resend code in <span style={{ fontWeight: 'bold', color: auroraTheme.colors.indigo[600] }}>{timer}s</span></p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: auroraTheme.colors.indigo[600],
                            cursor: 'pointer',
                            fontWeight: '600',
                            textDecoration: 'underline'
                        }}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                )}
                {resendMessage && (
                    <p style={{
                        marginTop: '8px',
                        fontSize: '13px',
                        color: resendMessage.includes('Failed') ? '#dc2626' : '#16a34a'
                    }}>
                        {resendMessage}
                    </p>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', color: auroraTheme.colors.gray[500], cursor: 'pointer', fontSize: '13px' }}
                >
                    Change Email
                </button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <form style={styles.form} onSubmit={handleResetPassword}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                Create a new password for your account.
            </p>
            <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <PasswordInput
                    placeholder="Minimum 8 characters"
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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
                    minLength={8}
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
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo}>🔐</div>
                        <h1 style={styles.title}>Forgot Password</h1>
                        <p style={styles.subtitle}>Reset access to your account</p>
                    </div>

                    {/* Step Indicators */}
                    <div style={styles.stepIndicator}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    ...styles.stepDot,
                                    ...(step === s ? styles.stepDotActive : {}),
                                    backgroundColor: step >= s ? auroraTheme.colors.indigo[500] : styles.stepDot.backgroundColor
                                }}
                            />
                        ))}
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center' as const,
                    }}>
                        <Link
                            href="/login"
                            style={{
                                color: auroraTheme.colors.gray[500],
                                fontSize: '14px',
                                textDecoration: 'none',
                            }}
                        >
                            ← Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
