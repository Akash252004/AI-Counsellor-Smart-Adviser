'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

interface UniversityDetails {
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
    scholarship_amounts: number[];
    programs_offered: string[];
    min_gpa: number;
    website: string;
}

const styles = {
    page: {
        minHeight: '100vh',
        background: auroraTheme.pageBg,
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    header: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: auroraTheme.shadows.lg,
    },
    universityName: {
        fontSize: '40px',
        fontWeight: '900',
        background: auroraTheme.primary,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '12px',
    },
    location: {
        fontSize: '18px',
        color: auroraTheme.colors.gray[600],
        marginBottom: '24px',
    },
    badges: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap' as const,
    },
    badge: {
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: auroraTheme.shadows.md,
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    cardContent: {
        fontSize: '15px',
        color: auroraTheme.colors.gray[700],
        lineHeight: '1.8',
    },
    statGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
    },
    stat: {
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: auroraTheme.colors.gray[50],
    },
    statLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[600],
        marginBottom: '8px',
        textTransform: 'uppercase' as const,
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    actionCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: auroraTheme.shadows.md,
    },
    button: {
        width: '100%',
        padding: '16px',
        fontSize: '16px',
        fontWeight: '700',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '12px',
    },
    primaryButton: {
        background: auroraTheme.primary,
        color: '#ffffff',
    },
    secondaryButton: {
        backgroundColor: auroraTheme.colors.gray[100],
        color: auroraTheme.colors.gray[700],
    },
    list: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
    },
    listItem: {
        padding: '12px 0',
        borderBottom: '1px solid ' + auroraTheme.colors.gray[100],
        fontSize: '14px',
        color: auroraTheme.colors.gray[700],
    },
    loading: {
        textAlign: 'center' as const,
        padding: '100px 20px',
        fontSize: '18px',
        color: auroraTheme.colors.gray[600],
    },
    skillTag: {
        display: 'inline-block',
        padding: '6px 12px',
        margin: '4px',
        borderRadius: '8px',
        backgroundColor: auroraTheme.colors.indigo[50],
        color: auroraTheme.colors.indigo[700],
        fontSize: '13px',
        fontWeight: '600',
    },
    strengthCard: {
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#dcfce7',
        border: '1px solid #bbf7d0',
        marginBottom: '12px',
    },
    weaknessCard: {
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        marginBottom: '12px',
    },
    warningCard: {
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fde047',
        textAlign: 'center' as const,
    },
};

function UniversityDetailPageContent({ universityId }: { universityId: string }) {
    const router = useRouter();
    const [university, setUniversity] = useState<UniversityDetails | null>(null);
    const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isShortlisted, setIsShortlisted] = useState(false);

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });

        // Check local cache first for instant feedback
        const cache = localStorage.getItem('shortlist_ids_cache');
        if (cache) {
            try {
                const ids = JSON.parse(cache);
                if (Array.isArray(ids) && ids.includes(parseInt(universityId))) {
                    setIsShortlisted(true);
                }
            } catch { }
        }

        fetchUniversityDetails();
        checkProfileCompletion();
        fetchMatchAnalysis();
        checkShortlistStatus();
    }, [universityId]);

    const fetchUniversityDetails = async () => {
        const id = parseInt(universityId);
        if (isNaN(id)) {
            console.error('Invalid university ID:', universityId);
            return;
        }

        try {
            const response = await apiClient.getUniversityDetails(id);
            setUniversity(response.data.university);
        } catch (error) {
            console.error('Error fetching university:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatchAnalysis = async () => {
        const id = parseInt(universityId);
        if (isNaN(id)) return;

        try {
            const response = await apiClient.getMatchAnalysis(id);
            setMatchAnalysis(response.data.match_analysis);
        } catch (error) {
            console.error("Error fetching match analysis:", error);
        }
    };

    const checkShortlistStatus = async () => {
        try {
            const response = await apiClient.getShortlist();
            if (response.data && response.data.shortlist) {
                const id = parseInt(universityId);
                let exists = false;

                // key is bucket name (Dream, Target, etc.), value is array of items
                Object.values(response.data.shortlist).forEach((list: any) => {
                    if (Array.isArray(list)) {
                        if (list.some((item: any) => item.university_id === id)) {
                            exists = true;
                        }
                    }
                });

                setIsShortlisted(exists);
            }
        } catch (error) {
            console.error('Error checking shortlist:', error);
        }
    };

    const checkProfileCompletion = async () => {
        try {
            const response = await apiClient.getProfile();
            const profile = response.data.profile;

            // Use server-side flag if available, otherwise check fields
            if (profile?.is_complete) {
                setProfileComplete(true);
            } else {
                // Fallback check with correct field names
                const isComplete = !!(
                    profile?.gpa &&
                    profile?.field_of_study &&
                    profile?.intended_degree
                );
                setProfileComplete(isComplete);
            }
        } catch (error) {
            setProfileComplete(false);
        }
    };

    const handleAddToShortlist = async () => {
        if (!university) return;
        if (isShortlisted) {
            alert('Already in your shortlist!');
            return;
        }

        // Optimistic Update
        setIsShortlisted(true);

        try {
            await apiClient.addToShortlist(university.id, 'Target');
            alert('Added to shortlist!');

            // Update local cache
            const cache = localStorage.getItem('shortlist_ids_cache');
            let ids = [];
            if (cache) {
                try { ids = JSON.parse(cache); } catch { }
            }
            if (Array.isArray(ids) && !ids.includes(university.id)) {
                ids.push(university.id);
                localStorage.setItem('shortlist_ids_cache', JSON.stringify(ids));
            }

        } catch (error: any) {
            setIsShortlisted(false);
            alert(error.response?.data?.detail || 'Failed to add to shortlist');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.loading}>Loading university details...</div>
            </>
        );
    }

    if (!university) {
        return (
            <>
                <Navbar />
                <div style={styles.loading}>University not found</div>
            </>
        );
    }

    const totalCost = university.tuition_max + university.living_cost_yearly;

    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h1 style={styles.universityName}>{university.name}</h1>
                        <p style={styles.location}>📍 {university.city}, {university.country}</p>
                        <div style={styles.badges}>
                            {university.ranking && university.ranking <= 500 && (
                                <span style={{ ...styles.badge, ...styles.rankingBadge }}>
                                    🏆 #{university.ranking} QS Ranking
                                </span>
                            )}
                            {university.has_scholarships && (
                                <span style={{ ...styles.badge, ...styles.scholarshipBadge }}>
                                    💰 Scholarships Available
                                </span>
                            )}
                            <span style={{ ...styles.badge, backgroundColor: auroraTheme.colors.blue[50], color: auroraTheme.colors.blue[600] }}>
                                {university.acceptance_rate}% Acceptance Rate
                            </span>
                        </div>
                    </div>

                    <div style={styles.grid}>
                        {/* Main Content */}
                        <div style={styles.mainContent}>
                            {/* About */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>📚 About {university.name}</h2>
                                <p style={styles.cardContent}>
                                    {university.name} is a prestigious institution located in {university.city}, {university.country}.
                                    {university.ranking && university.ranking <= 100 && ' Ranked among the top 100 universities globally,'}
                                    {' '}it offers world-class education with a {university.acceptance_rate}% acceptance rate.
                                    The university is known for its cutting-edge research facilities, diverse student community,
                                    and strong industry connections that provide excellent career opportunities for graduates.
                                </p>
                            </div>

                            {/* Cost Breakdown */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>💵 Cost Breakdown</h2>
                                <div style={styles.statGrid}>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Tuition (Annual)</div>
                                        <div style={styles.statValue}>${(university.tuition_max / 1000).toFixed(0)}K</div>
                                    </div>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Living Cost</div>
                                        <div style={styles.statValue}>${(university.living_cost_yearly / 1000).toFixed(0)}K</div>
                                    </div>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Total (Annual)</div>
                                        <div style={styles.statValue}>${(totalCost / 1000).toFixed(0)}K</div>
                                    </div>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Min GPA Required</div>
                                        <div style={styles.statValue}>{university.min_gpa}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Past Placements */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>🎯 Past Year Placements</h2>
                                <div style={styles.statGrid}>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Avg Starting Salary</div>
                                        <div style={styles.statValue}>$85K</div>
                                    </div>
                                    <div style={styles.stat}>
                                        <div style={styles.statLabel}>Placement Rate</div>
                                        <div style={styles.statValue}>92%</div>
                                    </div>
                                </div>
                                <p style={{ ...styles.cardContent, marginTop: '16px' }}>
                                    Top recruiters include Google, Microsoft, Amazon, Apple, and leading consulting firms.
                                    Average placement rate is 92% within 6 months of graduation.
                                </p>
                            </div>

                            {/* Skills Required */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>🛠️ Skills Required</h2>
                                <div>
                                    <span style={styles.skillTag}>Analytical Thinking</span>
                                    <span style={styles.skillTag}>Problem Solving</span>
                                    <span style={styles.skillTag}>Communication</span>
                                    <span style={styles.skillTag}>Leadership</span>
                                    <span style={styles.skillTag}>Technical Skills</span>
                                    <span style={styles.skillTag}>Research Ability</span>
                                    <span style={styles.skillTag}>Teamwork</span>
                                    <span style={styles.skillTag}>Time Management</span>
                                </div>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>
                                    🧠 AI Match Analysis
                                    {matchAnalysis && (
                                        <span style={{
                                            fontSize: '14px',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: matchAnalysis.category === 'Dream' ? '#fce7f3' : matchAnalysis.category === 'Safe' ? '#dcfce7' : '#dbeafe',
                                            color: matchAnalysis.category === 'Dream' ? '#be185d' : matchAnalysis.category === 'Safe' ? '#15803d' : '#1e40af',
                                            marginLeft: '12px'
                                        }}>
                                            {matchAnalysis.category}
                                        </span>
                                    )}
                                </h2>

                                {!profileComplete ? (
                                    <div style={styles.warningCard}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                                            ⚠️ Complete Your Profile
                                        </h3>
                                        <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                                            To see your AI-predicted match score, please complete your profile.
                                        </p>
                                        <button
                                            onClick={() => router.push('/profile')}
                                            style={{
                                                padding: '12px 24px',
                                                background: auroraTheme.primary,
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Complete Profile →
                                        </button>
                                    </div>
                                ) : matchAnalysis ? (
                                    <>
                                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>AI Confidence Score</div>
                                            <div style={{
                                                fontSize: '48px',
                                                fontWeight: '900',
                                                color: matchAnalysis.match_score >= 80 ? '#15803d' : matchAnalysis.match_score >= 60 ? '#d97706' : '#dc2626'
                                            }}>
                                                {matchAnalysis.match_score}%
                                            </div>
                                            <p style={{ fontSize: '15px', color: '#374151', fontStyle: 'italic', maxWidth: '80%', margin: '0 auto' }}>
                                                "{matchAnalysis.why_fits?.[0] || 'Analyzing fit based on your profile...'}"
                                            </p>
                                        </div>

                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#166534', marginBottom: '12px' }}>
                                            ✅ Analysis
                                        </h3>
                                        <div style={styles.strengthCard}>
                                            <strong>Verdict:</strong> {matchAnalysis.recommendation}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Generating AI Analysis...</div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div style={styles.sidebar}>
                            {/* Quick Actions */}
                            <div style={styles.actionCard}>
                                <h3 style={{ ...styles.cardTitle, fontSize: '18px', marginBottom: '16px' }}>Quick Actions</h3>
                                <button
                                    style={{
                                        ...styles.button,
                                        ...(isShortlisted
                                            ? { background: '#dcfce7', color: '#166534', cursor: 'default' }
                                            : styles.primaryButton
                                        )
                                    }}
                                    onClick={handleAddToShortlist}
                                    disabled={isShortlisted}
                                >
                                    {isShortlisted ? '✅ Shortlisted' : '+ Add to Shortlist'}
                                </button>
                                <button
                                    style={{ ...styles.button, ...styles.secondaryButton }}
                                    onClick={() => {
                                        const url = university.website && university.website.startsWith('http')
                                            ? university.website
                                            : `https://www.google.com/search?q=${encodeURIComponent(university.name)}`;
                                        window.open(url, '_blank');
                                    }}
                                >
                                    🌐 Visit Website
                                </button>
                            </div>

                            {/* Programs */}
                            <div style={styles.actionCard}>
                                <h3 style={{ ...styles.cardTitle, fontSize: '18px', marginBottom: '16px' }}>
                                    Programs Offered
                                </h3>
                                <ul style={styles.list}>
                                    {university.programs_offered.slice(0, 5).map((program, idx) => (
                                        <li key={idx} style={styles.listItem}>📖 {program}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Scholarships */}
                            {university.has_scholarships && (
                                <div style={styles.actionCard}>
                                    <h3 style={{ ...styles.cardTitle, fontSize: '18px', marginBottom: '16px' }}>
                                        💰 Scholarships
                                    </h3>
                                    <ul style={styles.list}>
                                        {university.scholarship_types.map((type, idx) => (
                                            <li key={idx} style={styles.listItem}>
                                                {type}
                                                {university.scholarship_amounts && university.scholarship_amounts[idx] ? (
                                                    <span style={{ fontWeight: '700', color: auroraTheme.colors.green[600] }}>
                                                        {' '}(${university.scholarship_amounts[idx].toLocaleString()})
                                                    </span>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const universityId = unwrappedParams?.id;

    // Guard against missing or invalid ID
    if (!universityId || universityId === 'undefined' || isNaN(parseInt(universityId))) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '100px 40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>University Not Found</h2>
                    <p style={{ color: '#6b7280' }}>The university you're looking for doesn't exist or the URL is invalid.</p>
                </div>
            </>
        );
    }
    return <UniversityDetailPageContent universityId={universityId} />;
}
