'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authHelpers } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { auroraTheme } from '@/lib/theme';




const styles = {
    page: {
        minHeight: '100vh',
        background: auroraTheme.pageBg,
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 24px',
    },

    // Hero Section with Robot
    hero: {
        position: 'relative' as const,
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        borderRadius: '24px',
        padding: '60px 40px',
        marginBottom: '40px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px',
    },
    heroContent: {
        position: 'relative' as const,
        zIndex: 1,
        flex: 1,
    },
    heroImageWrapper: {
        position: 'relative' as const,
        width: '400px',
        height: '400px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.6) 0%, rgba(99, 102, 241, 0.4) 100%)',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeTitle: {
        fontSize: '48px',
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: '12px',
        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    welcomeSubtitle: {
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '32px',
    },
    ctaButtons: {
        display: 'flex',
        gap: '16px',
    },
    ctaButton: {
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '700',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
    },
    ctaPrimary: {
        backgroundColor: '#ffffff',
        color: auroraTheme.colors.indigo[600],
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    ctaSecondary: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#ffffff',
        backdropFilter: 'blur(10px)',
    },

    // Progress Tracker
    progressSection: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: auroraTheme.shadows.md,
    },
    progressTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '24px',
    },
    progressSteps: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative' as const,
    },
    progressLine: {
        position: 'absolute' as const,
        top: '24px',
        left: '10%',
        right: '10%',
        height: '4px',
        backgroundColor: auroraTheme.colors.gray[200],
        borderRadius: '2px',
        zIndex: 0,
    },
    progressLineActive: {
        position: 'absolute' as const,
        top: '24px',
        left: '10%',
        height: '4px',
        background: auroraTheme.primary,
        borderRadius: '2px',
        zIndex: 1,
        transition: 'width 0.5s ease',
    },
    progressStep: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '12px',
        zIndex: 2,
        position: 'relative' as const,
    },
    stepCircle: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        border: '4px solid ' + auroraTheme.colors.gray[300],
        fontSize: '20px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[500],
        transition: 'all 0.3s ease',
    },
    stepCircleActive: {
        background: auroraTheme.primary,
        border: 'none',
        color: '#ffffff',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
    },
    stepCircleComplete: {
        background: auroraTheme.safe,
        border: 'none',
        color: '#ffffff',
    },
    stepLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[600],
    },

    // Stats Cards
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px',
    },
    statCard: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: auroraTheme.shadows.md,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative' as const,
        overflow: 'hidden',
        textDecoration: 'none',
    },
    statCardHover: {
        transform: 'translateY(-8px)',
        boxShadow: auroraTheme.shadows.lg,
    },
    statIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    statLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[600],
        marginBottom: '8px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    statValue: {
        fontSize: '48px',
        fontWeight: '900',
        lineHeight: '1',
        marginBottom: '8px',
    },
    statDescription: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[500],
    },

    // Profile Strength
    strengthSection: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: auroraTheme.shadows.md,
    },
    strengthTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '24px',
    },
    strengthGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    strengthCard: {
        padding: '24px',
        borderRadius: '16px',
        textAlign: 'center' as const,
    },
    strengthCardAcademics: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
    },
    strengthCardExams: {
        background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 100%)',
    },
    strengthCardSOP: {
        background: 'linear-gradient(135deg, #d1fae5 0%, #cffafe 100%)',
    },
    strengthLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[700],
        marginBottom: '8px',
    },
    strengthValue: {
        fontSize: '24px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
    },

    // Locked Section
    lockedSection: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: auroraTheme.shadows.md,
        border: '2px solid ' + auroraTheme.primary,
    },
    lockedGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    lockedCard: {
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid ' + auroraTheme.colors.gray[200],
        transition: 'transform 0.2s ease',
        cursor: 'default',
    },
    lockedTag: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#ffffff',
    }
};

interface DashboardData {
    profile_summary: any;
    current_stage: string;
    profile_strength: any;
    locked_universities?: any[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [shortlistCounts, setShortlistCounts] = useState({ dream: 0, target: 0, safe: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Load cached data on mount (SSR-safe)
    useEffect(() => {
        const cachedDashboard = localStorage.getItem('dashboard_cache');
        const cachedCounts = localStorage.getItem('shortlist_counts_cache');
        const cachedUsername = localStorage.getItem('dashboard_username');

        if (cachedDashboard) {
            try {
                setDashboardData(JSON.parse(cachedDashboard));
                setLoading(false);
            } catch { }
        }
        if (cachedCounts) {
            try {
                setShortlistCounts(JSON.parse(cachedCounts));
            } catch { }
        }
        if (cachedUsername) {
            setUserName(cachedUsername);
        }
    }, []);

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) {
                router.push('/login');
            } else {
                // Extract user from session
                const user = session.user;
                // Extract and format username from email (e.g., "akash.kumar@gmail.com" -> "Akash")
                const emailName = user?.email?.split('@')[0] || '';
                const cleanName = emailName.split(/[._-]/)[0]; // Get first part before dots/underscores
                const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
                const name = user?.user_metadata?.name || formattedName || 'User';
                setUserName(name);
                localStorage.setItem('dashboard_username', name);
                fetchDashboardData();
                fetchShortlistData();
            }
        });
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await apiClient.getDashboard();
            setDashboardData(response.data);
            // Cache the dashboard data
            localStorage.setItem('dashboard_cache', JSON.stringify(response.data));
            // Try to get name from profile if available
            if (response.data?.profile_summary?.full_name) {
                setUserName(response.data.profile_summary.full_name);
                localStorage.setItem('dashboard_username', response.data.profile_summary.full_name);
            }
            setError(null);
        } catch (err: any) {
            // Handle expected errors (404 = New user, 401 = Token expired)
            if (err.response) {
                if (err.response.status === 401) {
                    router.push('/login');
                    return;
                }
                if (err.response.status === 404) {
                    console.log('New user detected, redirecting to onboarding...');
                    router.push('/onboarding');
                    return;
                }
            }

            // Log unexpected errors
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchShortlistData = async () => {
        try {
            const response = await apiClient.getShortlist();
            setShortlistCounts(response.data.counts);
            // Cache shortlist counts
            localStorage.setItem('shortlist_counts_cache', JSON.stringify(response.data.counts));
        } catch (error) {
            console.warn('Error fetching shortlist:', error);
        }
    };

    const getStageProgress = (stage: string) => {
        const stages = ['PROFILE_COMPLETE', 'DISCOVERY', 'SHORTLISTING', 'LOCKED'];
        const current = stages.indexOf(stage);
        return current >= 0 ? current + 1 : 1;
    };

    // Loading state handled inside JSX to keep Navbar visible


    const currentProgress = dashboardData ? getStageProgress(dashboardData.current_stage) : 1;

    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    {error === 'profile_missing' ? (
                        <div style={{ textAlign: 'center' as const, padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '24px' }}>📝</div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: auroraTheme.colors.gray[900] }}>Complete Your Profile</h2>
                            <p style={{ color: auroraTheme.colors.gray[600], marginBottom: '32px' }}>
                                To get your personalized dashboard and recommendations, please set up your profile first.
                            </p>
                            <Link href="/profile" style={{
                                ...styles.ctaButton,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#ffffff',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}>
                                Go to Profile Setup
                            </Link>
                        </div>
                    ) : loading || !dashboardData ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '80vh'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid #e2e8f0',
                                borderTop: '4px solid ' + auroraTheme.primary,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '24px'
                            }}>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: auroraTheme.colors.gray[800], marginBottom: '8px' }}>
                                Loading Dashboard...
                            </h2>
                            <p style={{ color: auroraTheme.colors.gray[500] }}>
                                Checking your profile status
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Hero Section with Robot */}
                            <div style={styles.hero}>
                                <div style={styles.heroContent}>
                                    <h1 style={styles.welcomeTitle}>Welcome back, {userName}!</h1>
                                    <p style={styles.welcomeSubtitle}>
                                        Your AI-powered study abroad companion
                                    </p>
                                    <div style={styles.ctaButtons}>
                                        <Link href="/universities" style={{ ...styles.ctaButton, ...styles.ctaPrimary }}>
                                            🌍 Explore Universities
                                        </Link>
                                        <Link href="/ai-counsellor" style={{ ...styles.ctaButton, ...styles.ctaSecondary }}>
                                            💬 Chat with AI
                                        </Link>
                                    </div>
                                </div>
                                <div style={{
                                    ...styles.heroImageWrapper,
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 50%, rgba(139,92,246,0.2) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '24px',
                                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    animation: 'wave 2s ease-in-out infinite',
                                    padding: '20px',
                                }}>
                                    <style>{`
                                        @keyframes wave {
                                            0%, 100% { transform: rotate(-2deg) translateY(0); }
                                            50% { transform: rotate(2deg) translateY(-5px); }
                                        }
                                    `}</style>
                                    <Image
                                        src="/ai-robot-new.png"
                                        alt="AI Study Abroad Assistant Robot"
                                        fill
                                        style={{ objectFit: 'contain', borderRadius: '20px' }}
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Progress Tracker */}
                            <div style={styles.progressSection}>
                                <h2 style={styles.progressTitle}>Your Application Journey</h2>
                                <div style={styles.progressSteps}>
                                    <div style={styles.progressLine} />
                                    <div style={{ ...styles.progressLineActive, width: `${((currentProgress - 1) / 3) * 80}%` }} />

                                    {['Profile Setup', 'Discovery', 'Shortlisting', 'Application'].map((label, index) => (
                                        <div key={label} style={styles.progressStep}>
                                            <div
                                                style={{
                                                    ...styles.stepCircle,
                                                    ...(index + 1 < currentProgress ? styles.stepCircleComplete : {}),
                                                    ...(index + 1 === currentProgress ? styles.stepCircleActive : {}),
                                                }}
                                            >
                                                {index + 1 < currentProgress ? '✓' : index + 1}
                                            </div>
                                            <span style={styles.stepLabel}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Locked Universities Section (Only visible if locked items exist) */}
                            {dashboardData.locked_universities && dashboardData.locked_universities.length > 0 && (
                                <div style={styles.lockedSection}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h2 style={{ ...styles.progressTitle, marginBottom: 0 }}>🔒 Your Final List</h2>
                                        <span style={{ fontSize: '14px', color: auroraTheme.primary, fontWeight: '600' }}>
                                            {dashboardData.locked_universities.length} Locked
                                        </span>
                                    </div>
                                    <div style={styles.lockedGrid}>
                                        {dashboardData.locked_universities.map((uni: any) => (
                                            <div key={uni.id} style={styles.lockedCard}>
                                                <span style={{
                                                    ...styles.lockedTag,
                                                    background: uni.bucket === 'Dream' ? '#ec4899' : uni.bucket === 'Target' ? '#3b82f6' : '#10b981'
                                                }}>
                                                    {uni.bucket}
                                                </span>
                                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#1f2937' }}>{uni.name}</h3>
                                                <p style={{ fontSize: '13px', color: auroraTheme.colors.gray[600] }}>
                                                    📍 {uni.country}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <div style={styles.statsGrid}>
                                {/* Dream Schools */}
                                <Link
                                    href="/shortlist"
                                    style={{
                                        ...styles.statCard,
                                        ...(hoveredCard === 'dream' ? styles.statCardHover : {}),
                                    }}
                                    onMouseEnter={() => setHoveredCard('dream')}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div style={styles.statIcon}>🌟</div>
                                    <div style={styles.statLabel}>Dream Schools</div>
                                    <div style={{ ...styles.statValue, color: '#ec4899' }}>{shortlistCounts.dream}</div>
                                    <div style={styles.statDescription}>High reach universities</div>
                                </Link>

                                {/* Target Schools */}
                                <Link
                                    href="/shortlist"
                                    style={{
                                        ...styles.statCard,
                                        ...(hoveredCard === 'target' ? styles.statCardHover : {}),
                                    }}
                                    onMouseEnter={() => setHoveredCard('target')}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div style={styles.statIcon}>🎯</div>
                                    <div style={styles.statLabel}>Target Schools</div>
                                    <div style={{ ...styles.statValue, color: '#3b82f6' }}>{shortlistCounts.target}</div>
                                    <div style={styles.statDescription}>Good match universities</div>
                                </Link>

                                {/* Safe Schools */}
                                <Link
                                    href="/shortlist"
                                    style={{
                                        ...styles.statCard,
                                        ...(hoveredCard === 'safe' ? styles.statCardHover : {}),
                                    }}
                                    onMouseEnter={() => setHoveredCard('safe')}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div style={styles.statIcon}>✅</div>
                                    <div style={styles.statLabel}>Safe Schools</div>
                                    <div style={{ ...styles.statValue, color: '#10b981' }}>{shortlistCounts.safe}</div>
                                    <div style={styles.statDescription}>Likely admits</div>
                                </Link>
                            </div>

                            {/* Profile Strength */}
                            <div style={styles.strengthSection}>
                                <h2 style={styles.strengthTitle}>💪 Your Profile Strength</h2>
                                <div style={styles.strengthGrid}>
                                    <div style={{ ...styles.strengthCard, ...styles.strengthCardAcademics }}>
                                        <div style={styles.strengthLabel}>Academics</div>
                                        <div style={styles.strengthValue}>{dashboardData.profile_strength.academics}</div>
                                    </div>
                                    <div style={{ ...styles.strengthCard, ...styles.strengthCardExams }}>
                                        <div style={styles.strengthLabel}>Test Scores</div>
                                        <div style={styles.strengthValue}>{dashboardData.profile_strength.exams}</div>
                                    </div>
                                    <div style={{ ...styles.strengthCard, ...styles.strengthCardSOP }}>
                                        <div style={styles.strengthLabel}>Documents</div>
                                        <div style={styles.strengthValue}>{dashboardData.profile_strength.sop}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Floating and waving animation */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.5));
          }
        }
        
        .robot-container {
          animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
        }
        
        .robot-container img {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
        </>
    );
}
