'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import PasswordInput from '@/components/PasswordInput';

const styles = {
    page: {
        minHeight: '100vh',
        background: auroraTheme.pageBg,
    },
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    header: {
        marginBottom: '32px',
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
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: auroraTheme.shadows.md,
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid ' + auroraTheme.colors.gray[200],
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
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
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#ffffff',
    },
    button: {
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    buttonDisabled: {
        opacity: 0.7,
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
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: auroraTheme.colors.gray[500],
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '14px',
        marginBottom: '24px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
    }
};

export default function SettingsPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const checkAuth = async () => {
            const { session } = await authHelpers.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUserEmail(session.user?.email || '');
            }
        };
        checkAuth();
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        // Validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('New password must contain at least 8 characters, one uppercase letter, and one number.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // 1. Verify Current Password
            // We do this by attempting to sign in with the email and current password
            // This is a common pattern to strictly verify ownership before sensitive changes
            const { error: signInError } = await authHelpers.signIn(userEmail, currentPassword);

            if (signInError) {
                setError('Incorrect current password. Please try again.');
                setLoading(false);
                return;
            }

            // 2. Update to New Password
            const { error: updateError } = await authHelpers.updateUser({ password: newPassword });

            if (updateError) {
                setError(updateError.message || 'Failed to update password.');
            } else {
                setSuccess('Password updated successfully! You can use your new password next time you login.');
                // Clear fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }

        } catch (err: any) {
            console.error('Password change error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                <button style={styles.backButton} onClick={() => router.back()}>
                    ← Back
                </button>

                <div style={styles.header}>
                    <h1 style={styles.title}>Settings</h1>
                    <p style={styles.subtitle}>Manage your account preferences and security</p>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>
                        🔐 Security & Login
                    </h2>

                    <form style={styles.form} onSubmit={handleChangePassword}>
                        {error && (
                            <div style={styles.error}>
                                ⚠️ {error}
                            </div>
                        )}

                        {success && (
                            <div style={styles.success}>
                                ✅ {success}
                            </div>
                        )}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Current Password</label>
                            <PasswordInput
                                placeholder="Enter current password"
                                style={styles.input}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>New Password</label>
                            <PasswordInput
                                placeholder="Minimum 8 characters"
                                style={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                            <PasswordStrengthMeter password={newPassword} />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm New Password</label>
                            <PasswordInput
                                placeholder="Re-enter new password"
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
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
