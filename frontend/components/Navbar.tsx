'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers, supabase } from '@/lib/supabase';
import UserDropdown from './UserDropdown';
import { auroraTheme } from '@/lib/theme';

const styles = {
    navbar: {
        position: 'sticky' as const,
        top: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    },
    navContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '26px',
        fontWeight: '800',
        background: auroraTheme.primary,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
    },
    logoIcon: {
        fontSize: '32px',
    },
    navMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
    },
    navLink: {
        padding: '8px 0',
        paddingBottom: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[700],
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative' as const,
        borderBottom: '3px solid transparent',
    },
    navLinkActive: {
        color: auroraTheme.colors.indigo[600],
        fontWeight: '700',
        borderBottom: `3px solid ${auroraTheme.colors.indigo[600]}`,
    },
    navLinkHover: {
        color: auroraTheme.colors.indigo[600],
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
};

export default function Navbar() {


    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        // Client-side only path check
        setCurrentPath(window.location.pathname);

        const updateUser = (user: any) => {
            const fullName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            setUserName(fullName);
            setUserEmail(user.email || '');
        };

        // Initial check
        authHelpers.getSession().then(({ user }) => {
            if (user) updateUser(user);
        });

        // Real-time listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                updateUser(session.user);
            } else {
                setUserName('');
                setUserEmail('');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isActive = (path: string) => currentPath.startsWith(path);

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link href="/dashboard" style={styles.logo}>
                    <img
                        src="/logos/ai-counsellor-logo.png"
                        alt="AI Counsellor"
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                    AI Counsellor
                </Link>

                <div style={styles.navMenu}>
                    <Link
                        href="/dashboard"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/dashboard') ? styles.navLinkActive : {}),
                            ...(hoveredLink === 'dashboard' && !isActive('/dashboard') ? styles.navLinkHover : {}),
                        }}
                        onMouseEnter={() => setHoveredLink('dashboard')}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        🏠 Dashboard
                    </Link>

                    <Link
                        href="/universities"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/universities') ? styles.navLinkActive : {}),
                            ...(hoveredLink === 'universities' && !isActive('/universities') ? styles.navLinkHover : {}),
                        }}
                        onMouseEnter={() => setHoveredLink('universities')}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        🎓 Universities
                    </Link>

                    <Link
                        href="/shortlist"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/shortlist') ? styles.navLinkActive : {}),
                            ...(hoveredLink === 'shortlist' && !isActive('/shortlist') ? styles.navLinkHover : {}),
                        }}
                        onMouseEnter={() => setHoveredLink('shortlist')}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        ⭐ Shortlist
                    </Link>

                    <Link
                        href="/tasks"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/tasks') ? styles.navLinkActive : {}),
                            ...(hoveredLink === 'tasks' && !isActive('/tasks') ? styles.navLinkHover : {}),
                        }}
                        onMouseEnter={() => setHoveredLink('tasks')}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        ✅ Tasks
                    </Link>

                    <Link
                        href="/ai-counsellor"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/ai-counsellor') ? styles.navLinkActive : {}),
                            ...(hoveredLink === 'ai' && !isActive('/ai-counsellor') ? styles.navLinkHover : {}),
                        }}
                        onMouseEnter={() => setHoveredLink('ai')}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        🤖 AI Counsellor
                    </Link>
                </div>

                <div style={styles.userSection}>
                    <UserDropdown userName={userName} userEmail={userEmail} />
                </div>
            </div>
        </nav>
    );
}
