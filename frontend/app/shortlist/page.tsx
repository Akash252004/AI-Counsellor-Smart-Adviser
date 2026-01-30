'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { apiClient } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

interface ShortlistedUniversity {
    shortlist_id: number;
    university_id: number;
    bucket: string;
    is_locked: boolean;
    match_analysis: any;
    why_fits?: string;
    risks?: string;
    university: {
        id: number;
        name: string;
        country: string;
        city: string;
        tuition_min: number;
        tuition_max: number;
        living_cost_yearly: number;
        acceptance_rate: number;
    };
}

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
    header: {
        marginBottom: '40px',
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        background: auroraTheme.primary,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: auroraTheme.colors.gray[600],
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '40px',
    },
    statCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center' as const,
        boxShadow: auroraTheme.shadows.md,
    },
    statIcon: {
        fontSize: '32px',
        marginBottom: '12px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '800',
        marginBottom: '4px',
    },
    statLabel: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[600],
    },
    bucketsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '40px',
    },
    bucket: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: auroraTheme.shadows.md,
    },
    bucketHeader: {
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid ' + auroraTheme.colors.gray[100],
    },
    bucketTitle: {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '4px',
    },
    bucketSubtitle: {
        fontSize: '13px',
        color: auroraTheme.colors.gray[600],
    },
    universityCard: {
        backgroundColor: auroraTheme.colors.gray[50],
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    universityCardHover: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transform: 'translateY(-2px)',
    },
    universityName: {
        fontSize: '16px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '6px',
    },
    universityLocation: {
        fontSize: '13px',
        color: auroraTheme.colors.gray[600],
        marginBottom: '8px',
    },
    universityStats: {
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: auroraTheme.colors.gray[500],
        marginBottom: '12px',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        marginBottom: '12px',
    },
    statusShortlisted: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
    },
    statusApplied: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
    },
    button: {
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    viewButton: {
        flex: 1,
        backgroundColor: auroraTheme.colors.indigo[50],
        color: auroraTheme.colors.indigo[600],
    },
    lockButton: {
        flex: 1,
        background: auroraTheme.primary,
        color: '#ffffff',
    },
    removeButton: {
        padding: '8px',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        fontSize: '16px',
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: auroraTheme.colors.gray[500],
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '12px',
    },
    emptyText: {
        fontSize: '14px',
    },
    addMoreButton: {
        display: 'block',
        margin: '20px auto',
        padding: '12px 32px',
        fontSize: '15px',
        fontWeight: '600',
        background: auroraTheme.primary,
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        textDecoration: 'none',
    },
    loading: {
        textAlign: 'center' as const,
        padding: '100px 20px',
        fontSize: '18px',
        color: auroraTheme.colors.gray[600],
    },
};

export default function ShortlistPage() {
    const router = useRouter();
    const [shortlist, setShortlist] = useState<ShortlistedUniversity[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const hasCacheRef = useRef(false);

    // Load cached data on mount (SSR-safe)
    useEffect(() => {
        const cached = localStorage.getItem('shortlist_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.length > 0) {
                    setShortlist(parsed);
                    setLoading(false);
                    hasCacheRef.current = true;
                }
            } catch { }
        }
    }, []);

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });
        fetchShortlist();
    }, []);

    const fetchShortlist = async () => {
        // Only show loading if no cached data was loaded
        if (!hasCacheRef.current) setLoading(true);
        try {
            const response = await apiClient.getShortlist();
            // Backend returns: { shortlist: { dream: [], target: [], safe: [] } ... }
            const s = response.data.shortlist;
            const flatList = [...(s.dream || []), ...(s.target || []), ...(s.safe || [])];
            setShortlist(flatList);
            // Cache the data
            localStorage.setItem('shortlist_cache', JSON.stringify(flatList));
        } catch (error) {
            console.error('Error fetching shortlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = async (shortlistId: number, isLocked: boolean) => {
        try {
            await apiClient.toggleShortlistLock(shortlistId);
            setToastMessage(isLocked ? 'Unlocked successfully' : 'Locked successfully');
            fetchShortlist();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            setToastMessage(typeof detail === 'string' ? detail : 'Failed to update lock status');
        }
    };

    const handleRemove = async (shortlistId: number) => {
        // Optimistic update: Remove immediately from UI
        const previousShortlist = [...shortlist];
        const newShortlist = shortlist.filter(s => s.shortlist_id !== shortlistId);
        setShortlist(newShortlist);

        try {
            await apiClient.removeFromShortlist(shortlistId);
            // Update local cache to match
            localStorage.setItem('shortlist_cache', JSON.stringify(newShortlist));
            setToastMessage('Removed from shortlist');
        } catch (error: any) {
            // Revert on failure
            setShortlist(previousShortlist);
            const detail = error.response?.data?.detail;
            setToastMessage(typeof detail === 'string' ? detail : 'Failed to remove from shortlist');
        }
    };

    const lockedItems = shortlist.filter(s => s.is_locked);
    const unlockedItems = shortlist.filter(s => !s.is_locked);

    const renderUniversityCard = (item: ShortlistedUniversity) => {
        const bucketColor = item.bucket === 'Dream' ? '#ec4899' : item.bucket === 'Target' ? '#3b82f6' : '#10b981';

        return (
            <div
                key={item.shortlist_id}
                style={{
                    ...styles.universityCard,
                    ...(hoveredCard === item.shortlist_id ? styles.universityCardHover : {}),
                    borderLeft: `4px solid ${bucketColor}`
                }}
                onMouseEnter={() => setHoveredCard(item.shortlist_id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={styles.universityName}>{item.university?.name || 'Unknown University'}</h3>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: bucketColor,
                        backgroundColor: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: `1px solid ${bucketColor}`
                    }}>
                        {item.bucket}
                    </span>
                </div>

                <p style={styles.universityLocation}>
                    📍 {item.university?.city}, {item.university?.country}
                </p>

                <div style={styles.universityStats}>
                    <span>💵 ${(((item.university?.tuition_max || 0) + (item.university?.living_cost_yearly || 0)) / 1000).toFixed(0)}K/yr</span>
                    <span>📊 {item.university?.acceptance_rate || 0}% admit</span>
                </div>

                {(item.why_fits || item.risks) && (
                    <div style={{ margin: '12px 0', fontSize: '13px', lineHeight: '1.5' }}>
                        {item.why_fits && (
                            <div style={{ marginBottom: '4px', color: '#059669' }}>
                                <strong>Why:</strong> {item.why_fits}
                            </div>
                        )}
                        {item.risks && (
                            <div style={{ color: '#dc2626' }}>
                                <strong>Risk:</strong> {item.risks}
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.cardActions}>
                    <button
                        style={{ ...styles.button, ...styles.viewButton }}
                        onClick={() => router.push(`/universities/${item.university_id}`)}
                    >
                        View
                    </button>
                    <button
                        style={{
                            ...styles.button,
                            ...styles.lockButton,
                            background: item.is_locked ? '#9ca3af' : auroraTheme.primary
                        }}
                        onClick={() => handleToggleLock(item.shortlist_id, item.is_locked)}
                    >
                        {item.is_locked ? 'Unlock' : 'Lock In'}
                    </button>
                    {!item.is_locked && (
                        <button
                            style={{ ...styles.button, ...styles.removeButton }}
                            onClick={() => handleRemove(item.shortlist_id)}
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.loading}>Loading shortlist...</div>
                {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Shortlist & Lock-In</h1>
                        <p style={styles.subtitle}>
                            Manage your shortlist and lock your final 4 universities.
                        </p>
                    </div>

                    {/* Shortlisted Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📝 Shortlisted Universities <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>({unlockedItems.length})</span>
                        </h2>
                        {unlockedItems.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤔</div>
                                <p style={styles.emptyText}>No active shortlisted universities.</p>
                                <Link href="/universities" style={{ ...styles.addMoreButton, display: 'inline-block', marginTop: '12px' }}>
                                    Browse Universities
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {unlockedItems.map(renderUniversityCard)}
                            </div>
                        )}
                        {unlockedItems.length > 0 && (
                            <Link href="/universities" style={{ ...styles.addMoreButton, width: 'fit-content', margin: '20px 0' }}>
                                + Add More
                            </Link>
                        )}
                    </div>

                    {/* Locked Section */}
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        padding: '32px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: '2px solid ' + auroraTheme.primary
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: auroraTheme.primary }}>
                                    🔒 Locked-In Applications
                                </h2>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>Your final selection for application tracking</p>
                            </div>
                            <div style={{
                                padding: '8px 16px',
                                background: lockedItems.length >= 4 ? '#fee2e2' : '#f0f9ff',
                                borderRadius: '12px',
                                color: lockedItems.length >= 4 ? '#dc2626' : auroraTheme.primary,
                                fontWeight: 'bold'
                            }}>
                                {lockedItems.length} / 4 Locked
                            </div>
                        </div>

                        {lockedItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
                                <p>No universities locked yet. Click "Lock In" on a shortlisted university above.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {lockedItems.map(renderUniversityCard)}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        </>
    );
}
