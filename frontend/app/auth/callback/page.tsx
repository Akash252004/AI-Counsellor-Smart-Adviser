'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, authHelpers } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import { auroraTheme } from '@/lib/theme';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Completing sign in...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');
            const errorDesc = searchParams.get('error_description');

            if (errorParam) {
                setError(errorDesc || 'Authentication failed');
                setTimeout(() => router.push('/login'), 3000);
                return;
            }

            if (!code) {
                // If no code, maybe we're already logged in? Check session
                const { session } = await authHelpers.getSession();
                if (session) {
                    checkProfileAndRedirect();
                } else {
                    router.push('/login');
                }
                return;
            }

            try {
                // Exchange code for session
                const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

                if (sessionError) {
                    throw sessionError;
                }

                // Success! Now check profile
                await checkProfileAndRedirect();

            } catch (err: any) {
                console.error('Callback error:', err);
                setError(err.message || 'Failed to complete sign in');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    const checkProfileAndRedirect = async () => {
        setStatus('Checking profile...');
        try {
            // Check if user has a profile
            const profileResponse = await apiClient.getProfile();

            if (profileResponse.data && profileResponse.data.exists) {
                setStatus('Redirecting to dashboard...');
                router.push('/dashboard');
            } else {
                setStatus('Redirecting to onboarding...');
                router.push('/onboarding');
            }
        } catch (err) {
            console.error('Profile check error:', err);
            // Fallback to dashboard
            router.push('/dashboard');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: auroraTheme.pageBg,
        }}>
            <div style={{
                background: '#ffffff',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: auroraTheme.shadows.lg,
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%'
            }}>
                {error ? (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#dc2626' }}>
                            Sign In Failed
                        </h2>
                        <p style={{ color: auroraTheme.colors.gray[600], marginBottom: '16px' }}>
                            {error}
                        </p>
                        <p style={{ fontSize: '14px', color: auroraTheme.colors.gray[500] }}>
                            Redirecting to login...
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: `3px solid ${auroraTheme.colors.indigo[100]}`,
                            borderTop: `3px solid ${auroraTheme.primary}`,
                            borderRadius: '50%',
                            margin: '0 auto 24px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: auroraTheme.colors.gray[900] }}>
                            {status}
                        </h2>
                        <style jsx global>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </>
                )}
            </div>
        </div>
    );
}
