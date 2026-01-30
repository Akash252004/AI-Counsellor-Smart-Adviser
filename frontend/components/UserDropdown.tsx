'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

interface UserDropdownProps {
    userName: string;
    userEmail: string;
}

const styles = {
    container: {
        position: 'relative' as const,
    },
    trigger: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: auroraTheme.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '700',
        border: '2px solid ' + auroraTheme.colors.indigo[100],
    },
    dropdown: {
        position: 'absolute' as const,
        top: '100%',
        right: 0,
        marginTop: '12px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        border: '1px solid ' + auroraTheme.colors.gray[200],
        minWidth: '280px',
        padding: '12px',
        zIndex: 1001,
    },
    userInfo: {
        padding: '16px',
        borderBottom: '1px solid ' + auroraTheme.colors.gray[100],
        marginBottom: '8px',
    },
    userName: {
        fontSize: '16px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '4px',
    },
    userEmail: {
        fontSize: '13px',
        color: auroraTheme.colors.gray[500],
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        color: auroraTheme.colors.gray[700],
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    menuItemHover: {
        backgroundColor: auroraTheme.colors.indigo[50],
        color: auroraTheme.colors.indigo[700],
    },
    menuIcon: {
        fontSize: '18px',
    },
    divider: {
        height: '1px',
        backgroundColor: auroraTheme.colors.gray[100],
        margin: '8px 0',
    },
    logoutItem: {
        color: '#dc2626',
    },
};

export default function UserDropdown({ userName, userEmail }: UserDropdownProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const handleLogout = async () => {
        await authHelpers.signOut();
        router.push('/');
    };

    const userInitial = userName && userName !== 'User'
        ? userName.trim().charAt(0).toUpperCase()
        : userEmail
            ? userEmail.charAt(0).toUpperCase()
            : 'U';

    return (
        <div style={styles.container}>
            <div
                style={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={styles.avatar}>{userInitial}</div>
            </div>

            {isOpen && (
                <div style={styles.dropdown}>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{userName}</div>
                        <div style={styles.userEmail}>{userEmail}</div>
                    </div>

                    <Link
                        href="/profile"
                        style={{
                            ...styles.menuItem,
                            ...(hoveredItem === 'profile' ? styles.menuItemHover : {}),
                        }}
                        onMouseEnter={() => setHoveredItem('profile')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <span style={styles.menuIcon}>👤</span>
                        <span>Profile</span>
                    </Link>




                    <Link
                        href="/settings"
                        style={{
                            ...styles.menuItem,
                            ...(hoveredItem === 'settings' ? styles.menuItemHover : {}),
                        }}
                        onMouseEnter={() => setHoveredItem('settings')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <span style={styles.menuIcon}>⚙️</span>
                        <span>Settings</span>
                    </Link>

                    <div style={styles.divider} />

                    <div
                        style={{
                            ...styles.menuItem,
                            ...styles.logoutItem,
                            ...(hoveredItem === 'logout' ? { backgroundColor: '#fef2f2' } : {}),
                        }}
                        onMouseEnter={() => setHoveredItem('logout')}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={handleLogout}
                    >
                        <span style={styles.menuIcon}>🚪</span>
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </div>
    );
}
