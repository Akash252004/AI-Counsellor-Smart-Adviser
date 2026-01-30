'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { apiClient } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

interface University {
    id: number;
    name: string;
    country: string;
    city: string;
    ranking: number;
    tuition_min: number;
    tuition_max: number;
    living_cost_yearly: number;
    acceptance_rate: number;
    has_scholarships: boolean;
    scholarship_types: string[];
    programs_offered: string[];
    min_gpa: number;
    match_score?: number;
    category?: string;
    shortlist_info?: {
        bucket: string;
        is_locked: boolean;
    };
}

const styles = {
    page: {
        minHeight: '100vh',
        background: auroraTheme.pageBg,
        padding: '40px 20px',
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
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
    layout: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
    },
    sidebar: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: auroraTheme.shadows.md,
        height: 'fit-content',
        position: 'sticky' as const,
        top: '90px',
    },
    filterSection: {
        marginBottom: '24px',
    },
    filterTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
    },
    checkbox: {
        marginRight: '8px',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[700],
        cursor: 'pointer',
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    mainContent: {
        minHeight: '500px',
    },
    viewToggle: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
    },
    toggleButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: '#ffffff',
        color: auroraTheme.colors.gray[600],
    },
    toggleButtonActive: {
        background: auroraTheme.primary,
        color: '#ffffff',
        border: '2px solid transparent',
    },
    universityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: auroraTheme.shadows.md,
    },
    cardHover: {
        transform: 'translateY(-4px)',
        boxShadow: auroraTheme.shadows.xl,
    },
    cardHeader: {
        marginBottom: '16px',
    },
    universityName: {
        fontSize: '18px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '6px',
    },
    location: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[500],
        marginBottom: '12px',
    },
    badges: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap' as const,
        marginBottom: '12px',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
    },
    rankingBadge: {
        background: auroraTheme.primary,
        color: '#ffffff',
    },
    scholarshipBadge: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    matchBadge: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
    },
    stat: {
        fontSize: '12px',
        color: auroraTheme.colors.gray[500],
    },
    statValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '2px',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid ' + auroraTheme.colors.gray[100],
    },
    viewButton: {
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        color: auroraTheme.colors.indigo[600],
        backgroundColor: auroraTheme.colors.indigo[50],
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    addButton: {
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    loading: {
        textAlign: 'center' as const,
        padding: '60px 20px',
        fontSize: '16px',
        color: auroraTheme.colors.gray[600],
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '60px 20px',
        background: '#ffffff',
        borderRadius: '16px',
        marginTop: '20px',
        boxShadow: auroraTheme.shadows.md,
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '8px',
    },
    emptyText: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[600],
        marginBottom: '24px',
    },
    ctaButton: {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
    }
};

export default function UniversitiesPage() {
    const router = useRouter();
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'all' | 'recommended'>('recommended');
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [shortlistedIds, setShortlistedIds] = useState<Set<number>>(new Set());

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedField, setSelectedField] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [minGPA, setMinGPA] = useState('');
    const [scholarshipsOnly, setScholarshipsOnly] = useState(false);

    // Load cached data when view changes
    useEffect(() => {
        const cacheKey = `universities_cache_${view}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.length > 0) {
                    setUniversities(parsed);
                    setLoading(false);
                }
            } catch { }
        }

        // Load shortlist cache
        const cachedIds = localStorage.getItem('shortlist_ids_cache');
        if (cachedIds) {
            try {
                const parsed = JSON.parse(cachedIds);
                if (Array.isArray(parsed)) {
                    setShortlistedIds(new Set(parsed));
                }
            } catch { }
        }
    }, [view]);

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });
        fetchUniversities();
        fetchShortlistIds();

        // Refresh shortlist status when window gains focus (e.g. returning from details page)
        const onFocus = () => {
            fetchShortlistIds();
        };
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('focus', onFocus);
        };
    }, [view]);

    const fetchShortlistIds = async () => {
        try {
            const res = await apiClient.getShortlist();
            const ids = new Set<number>();
            if (res.data.shortlist) {
                Object.values(res.data.shortlist).forEach((list: any) => {
                    list.forEach((item: any) => ids.add(item.university.id));
                });
            }
            setShortlistedIds(ids);
            localStorage.setItem('shortlist_ids_cache', JSON.stringify(Array.from(ids)));
        } catch (e) {
            console.error("Failed to sync shortlist status", e);
        }
    };

    const fetchUniversities = async () => {
        try {
            if (view === 'recommended') {
                const response = await apiClient.getRecommendations(50);
                setUniversities(response.data.recommendations);
                localStorage.setItem('universities_cache_recommended', JSON.stringify(response.data.recommendations));
            } else {
                const response = await apiClient.searchUniversities({});
                setUniversities(response.data.universities);
                localStorage.setItem('universities_cache_all', JSON.stringify(response.data.universities));
            }
        } catch (error) {
            console.error('Error fetching universities:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const filters: any = {};
        if (searchQuery) filters.search = searchQuery;
        if (selectedCountry) filters.country = selectedCountry;
        if (selectedField) filters.field = selectedField;
        if (maxBudget) filters.max_budget = parseFloat(maxBudget);
        if (minGPA) filters.min_gpa = parseFloat(minGPA);
        if (scholarshipsOnly) filters.has_scholarships = true;

        setLoading(true);
        apiClient.searchUniversities(filters)
            .then(response => {
                setUniversities(response.data.universities);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error filtering:', error);
                setLoading(false);
            });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCountry('');
        setSelectedField('');
        setMaxBudget('');
        setMinGPA('');
        setScholarshipsOnly(false);
        fetchUniversities();
    };

    const handleAddToShortlist = async (universityId: number, category: string | undefined, e: React.MouseEvent) => {
        e.stopPropagation();
        if (shortlistedIds.has(universityId)) return;

        // Optimistic Update
        const previousIds = new Set(shortlistedIds);
        setShortlistedIds(prev => new Set(prev).add(universityId));

        try {
            // Use the recommended category, or default to Target
            const bucket = category || 'Target';
            await apiClient.addToShortlist(universityId, bucket);
            setToastMessage('Added to shortlist!');

            // Update cache
            const newIds = new Set(previousIds).add(universityId);
            localStorage.setItem('shortlist_ids_cache', JSON.stringify(Array.from(newIds)));

        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Failed to add to shortlist';
            if (msg.includes('already')) {
                setToastMessage('Already in shortlist');
            } else {
                // Revert on real failure
                setToastMessage(msg);
                setShortlistedIds(previousIds);
            }
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Discover Universities</h1>
                        <p style={styles.subtitle}>
                            Explore {universities.length} universities worldwide with AI-powered recommendations
                        </p>
                    </div>

                    <div style={styles.layout}>
                        {/* Sidebar Filters */}
                        <div style={styles.sidebar}>
                            <div style={styles.filterSection}>
                                <h3 style={styles.filterTitle}>Search</h3>
                                <input
                                    type="text"
                                    placeholder="University name..."
                                    style={styles.input}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div style={styles.filterSection}>
                                <h3 style={styles.filterTitle}>Country</h3>
                                <select
                                    style={styles.select}
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                >
                                    <option value="">All Countries</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                    <option value="Germany">Germany</option>
                                    <option value="Netherlands">Netherlands</option>
                                    <option value="Singapore">Singapore</option>
                                    <option value="Ireland">Ireland</option>
                                </select>
                            </div>

                            <div style={styles.filterSection}>
                                <h3 style={styles.filterTitle}>Field of Study</h3>
                                <input
                                    type="text"
                                    placeholder="e.g., Computer Science"
                                    style={styles.input}
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                />
                            </div>

                            <div style={styles.filterSection}>
                                <h3 style={styles.filterTitle}>Max Budget (USD)</h3>
                                <input
                                    type="number"
                                    placeholder="50000"
                                    style={styles.input}
                                    value={maxBudget}
                                    onChange={(e) => setMaxBudget(e.target.value)}
                                />
                            </div>

                            <div style={styles.filterSection}>
                                <h3 style={styles.filterTitle}>Your GPA</h3>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="3.5"
                                    style={styles.input}
                                    value={minGPA}
                                    onChange={(e) => setMinGPA(e.target.value)}
                                />
                            </div>

                            <div style={styles.filterSection}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={scholarshipsOnly}
                                        onChange={(e) => setScholarshipsOnly(e.target.checked)}
                                    />
                                    Scholarships available
                                </label>
                            </div>

                            <button style={styles.button} onClick={applyFilters}>
                                Apply Filters
                            </button>
                            <button
                                style={{ ...styles.button, background: '#e5e7eb', color: '#374151', marginTop: '8px' }}
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>

                        {/* Main Content */}
                        <div style={styles.mainContent}>
                            <div style={styles.viewToggle}>
                                <button
                                    style={{
                                        ...styles.toggleButton,
                                        ...(view === 'recommended' ? styles.toggleButtonActive : {}),
                                    }}
                                    onClick={() => setView('recommended')}
                                >
                                    🎯 Recommended For You
                                </button>
                                <button
                                    style={{
                                        ...styles.toggleButton,
                                        ...(view === 'all' ? styles.toggleButtonActive : {}),
                                    }}
                                    onClick={() => setView('all')}
                                >
                                    🌍 All Universities
                                </button>
                            </div>

                            {loading ? (
                                <div style={styles.universityGrid}>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} style={{ ...styles.card, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }}>
                                            <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '12px', width: '70%' }}></div>
                                            <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', width: '40%' }}></div>
                                            <div style={{ height: '60px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '16px' }}></div>
                                            <div style={{ height: '36px', background: '#e2e8f0', borderRadius: '8px', width: '50%' }}></div>
                                        </div>
                                    ))}
                                </div>
                            ) : universities.length === 0 ? (
                                <div style={styles.emptyState}>
                                    {view === 'recommended' ? (
                                        <>
                                            <div style={styles.emptyIcon}>📝</div>
                                            <h3 style={styles.emptyTitle}>Personalized Recommendations Unavailable</h3>
                                            <p style={styles.emptyText}>
                                                Complete your profile to get AI-powered university matches tailored to your goals.
                                            </p>
                                            <Link href="/profile" style={styles.ctaButton}>
                                                Complete Profile
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <div style={styles.emptyIcon}>🎓</div>
                                            <h3 style={styles.emptyTitle}>No universities found</h3>
                                            <p style={styles.emptyText}>Try adjusting your filters or search criteria</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.universityGrid}>
                                    {universities.map((uni) => (
                                        <div
                                            key={uni.id}
                                            style={{
                                                ...styles.card,
                                                ...(hoveredCard === uni.id ? styles.cardHover : {}),
                                            }}
                                            onMouseEnter={() => setHoveredCard(uni.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => router.push(`/universities/${uni.id}`)}
                                        >
                                            <div style={styles.cardHeader}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                    <h3 style={styles.universityName}>{uni.name}</h3>
                                                    {uni.shortlist_info ? (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: uni.shortlist_info.bucket === 'Dream' ? '#ec4899' : uni.shortlist_info.bucket === 'Target' ? '#3b82f6' : '#10b981',
                                                            border: `1px solid ${uni.shortlist_info.bucket === 'Dream' ? '#ec4899' : uni.shortlist_info.bucket === 'Target' ? '#3b82f6' : '#10b981'}`,
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: '#fff',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {uni.shortlist_info.is_locked ? '🔒 ' : ''}{uni.shortlist_info.bucket}
                                                        </span>
                                                    ) : uni.category ? (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: uni.category === 'Dream' ? '#ec4899' : uni.category === 'Target' ? '#3b82f6' : '#10b981',
                                                            border: `1px solid ${uni.category === 'Dream' ? '#ec4899' : uni.category === 'Target' ? '#3b82f6' : '#10b981'}`,
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: '#fff',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {uni.category}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p style={styles.location}>
                                                    📍 {uni.city}, {uni.country}
                                                </p>
                                                <div style={styles.badges}>
                                                    {uni.ranking && uni.ranking <= 100 && (
                                                        <span style={{ ...styles.badge, ...styles.rankingBadge }}>
                                                            #{uni.ranking} Globally
                                                        </span>
                                                    )}
                                                    {uni.has_scholarships && (
                                                        <span style={{ ...styles.badge, ...styles.scholarshipBadge }}>
                                                            💰 Scholarships
                                                        </span>
                                                    )}
                                                    {uni.match_score && (
                                                        <span style={{ ...styles.badge, ...styles.matchBadge }}>
                                                            {uni.match_score}% Match
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={styles.stats}>
                                                <div style={styles.stat}>
                                                    <div style={styles.statValue}>
                                                        ${((uni.tuition_max + uni.living_cost_yearly) / 1000).toFixed(0)}K
                                                    </div>
                                                    Annual Cost
                                                </div>
                                                <div style={styles.stat}>
                                                    <div style={styles.statValue}>{uni.acceptance_rate}%</div>
                                                    Acceptance
                                                </div>
                                            </div>

                                            <div style={styles.cardFooter}>
                                                <button
                                                    style={styles.viewButton}
                                                    onClick={() => router.push(`/universities/${uni.id}`)}
                                                >
                                                    View Details →
                                                </button>
                                                <button
                                                    style={{
                                                        ...styles.addButton,
                                                        ...(shortlistedIds.has(uni.id) ? { background: '#10b981', cursor: 'default' } : {})
                                                    }}
                                                    onClick={(e) => handleAddToShortlist(uni.id, uni.category, e)}
                                                    disabled={shortlistedIds.has(uni.id)}
                                                >
                                                    {shortlistedIds.has(uni.id) ? '✔ Shortlisted' : '+ Shortlist'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </>
    );
}
