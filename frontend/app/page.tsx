'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auroraTheme } from '@/lib/theme';

const styles = {
  page: {
    minHeight: '100vh',
    background: auroraTheme.pageBg,
    fontFamily: 'inherit',
    overflowX: 'hidden' as const,
  },

  // Navigation
  nav: {
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    background: auroraTheme.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    cursor: 'pointer',
    padding: '4px 0', // Prevent clipping of gradient descenders
  },
  navLinks: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: auroraTheme.colors.gray[600],
    fontWeight: '600',
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  signInBtn: {
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid ' + auroraTheme.colors.indigo[100],
    color: auroraTheme.colors.indigo[600],
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: 'white',
  },

  // Hero Section
  hero: {
    padding: '80px 24px 60px',
    textAlign: 'center' as const,
    maxWidth: '1000px',
    margin: '0 auto',
    position: 'relative' as const,
  },
  heroBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '50px',
    background: auroraTheme.colors.indigo[50],
    color: auroraTheme.colors.indigo[600],
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '24px',
    border: '1px solid ' + auroraTheme.colors.indigo[100],
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '900',
    color: auroraTheme.colors.gray[900],
    marginBottom: '24px',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  heroTitleGradient: {
    background: auroraTheme.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: auroraTheme.colors.gray[600],
    marginBottom: '48px',
    maxWidth: '700px',
    margin: '0 auto 48px',
    lineHeight: '1.6',
  },
  ctaContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '60px',
  },
  primaryCta: {
    ...auroraTheme.button.primary,
    fontSize: '16px',
    padding: '16px 32px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: auroraTheme.shadows.glow,
  },
  secondaryCta: {
    ...auroraTheme.button.secondary,
    fontSize: '16px',
    padding: '16px 32px',
    textDecoration: 'none',
    display: 'inline-block',
    backgroundColor: 'white',
    border: '1px solid ' + auroraTheme.colors.gray[200],
  },

  // Features
  features: {
    padding: '80px 24px',
    background: 'white',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: auroraTheme.colors.gray[900],
    marginBottom: '16px',
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: auroraTheme.colors.gray[500],
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    ...auroraTheme.card.default,
    padding: '32px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '20px',
    background: auroraTheme.colors.indigo[50],
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: auroraTheme.colors.gray[900],
    marginBottom: '12px',
  },
  featureDesc: {
    fontSize: '15px',
    color: auroraTheme.colors.gray[600],
    lineHeight: '1.6',
  },

  // Stats
  stats: {
    padding: '80px 24px',
    background: auroraTheme.primary,
    color: 'white',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '16px',
    opacity: 0.9,
    fontWeight: '500',
  },

  // Footer
  footer: {
    padding: '60px 24px',
    background: auroraTheme.colors.gray[50], // Light footer to match app theme
    borderTop: '1px solid ' + auroraTheme.colors.gray[200],
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: auroraTheme.colors.gray[900],
    marginBottom: '20px',
  },
  footerLink: {
    display: 'block',
    color: auroraTheme.colors.gray[500],
    textDecoration: 'none',
    marginBottom: '12px',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  copyright: {
    textAlign: 'center' as const,
    marginTop: '60px',
    paddingTop: '30px',
    borderTop: '1px solid ' + auroraTheme.colors.gray[200],
    color: auroraTheme.colors.gray[400],
    fontSize: '14px',
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: '🎯',
      title: 'AI Matching',
      description: 'Smart algorithms that match your profile with the perfect universities based on your goals.',
    },
    {
      icon: '🌍',
      title: 'Global Database',
      description: 'Access detailed information about 29+ top universities across major study abroad destinations.',
    },
    {
      icon: '💰',
      title: 'Smart Budgeting',
      description: 'Plan your finances with tuition calculators, scholarship finders, and cost of living estimates.',
    },
    {
      icon: '📝',
      title: 'SOP Assistant',
      description: 'AI-powered guidance to help you craft compelling Statements of Purpose and essays.',
    },
    {
      icon: '📊',
      title: 'Application Tracker',
      description: 'Manage deadlines, documents, and application statuses all in one organized dashboard.',
    },
    {
      icon: '🤖',
      title: '24/7 Counsellor',
      description: 'Get instant answers to your doubts about visas, admissions, and more from our AI bot.',
    },
  ];

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>AI Counsellor</div>
        <div style={styles.navLinks}>
          <Link href="/login" style={styles.signInBtn}>
            Sign In
          </Link>
          <Link href="/signup" style={styles.primaryCta}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        style={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={styles.heroBadge}>✨ New 2026 Admissions Open</div>
        <h1 style={styles.heroTitle}>
          Your Personal
          <span style={styles.heroTitleGradient}> AI Study Abroad Guide</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Navigate your journey to top global universities with AI-powered recommendations, application tracking, and personalized counselling.
        </p>
        <div style={styles.ctaContainer}>
          <Link href="/signup" style={styles.primaryCta}>
            Start Your Journey 🚀
          </Link>
          <Link href="/login" style={styles.secondaryCta}>
            Resume Application
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything You Need</h2>
          <p style={styles.sectionSubtitle}>Complete toolkit for your study abroad success</p>
        </div>

        <div style={styles.grid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              style={{
                ...styles.featureCard,
                ...(hoveredFeature === index ? auroraTheme.card.hover : {}),
              }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.statsContainer}>
          {[
            { value: '29+', label: 'Partner Universities' },
            { value: '500+', label: 'Students Placed' },
            { value: '$2M+', label: 'Scholarships Unlocked' },
            { value: '100%', label: 'Application Success' }
          ].map((stat, index) => (
            <div key={index}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div>
            <div style={{ ...styles.logo, fontSize: '20px', marginBottom: '20px' }}>AI Counsellor</div>
            <p style={{ fontSize: '14px', color: auroraTheme.colors.gray[500], lineHeight: '1.6' }}>
              Empowering students to achieve their global education dreams through technology and guidance.
            </p>
          </div>
          <div>
            <h4 style={styles.footerTitle}>Platform</h4>
            <a href="#" style={styles.footerLink}>University Search</a>
            <a href="#" style={styles.footerLink}>Scholarships</a>
            <a href="#" style={styles.footerLink}>Success Stories</a>
          </div>
          <div>
            <h4 style={styles.footerTitle}>Company</h4>
            <a href="#" style={styles.footerLink}>About Us</a>
            <a href="#" style={styles.footerLink}>Careers</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
          <div>
            <h4 style={styles.footerTitle}>Legal</h4>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
            <a href="#" style={styles.footerLink}>Terms of Service</a>
          </div>
        </div>
        <div style={styles.copyright}>
          © 2026 AI Counsellor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
