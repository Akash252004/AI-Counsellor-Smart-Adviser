'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import { useUserStore } from '@/store/userStore';

import { auroraTheme } from '@/lib/theme';

const styles = {
    page: {
        minHeight: '100vh',
        background: auroraTheme.pageBg,
        padding: '40px 20px',
        fontFamily: 'inherit',
    },
    container: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        padding: '50px 40px',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '40px',
    },
    logo: {
        fontSize: '24px',
        fontWeight: '700',
        background: `linear-gradient(135deg, ${auroraTheme.colors.indigo[600]} 0%, ${auroraTheme.colors.purple[500]} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px',
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
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px',
    },
    stepWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
    },
    stepRow: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    stepCircle: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '16px',
        transition: 'all 0.3s ease',
    },
    stepCircleActive: {
        background: auroraTheme.primary,
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
    },
    stepCircleInactive: {
        backgroundColor: auroraTheme.colors.gray[200],
        color: auroraTheme.colors.gray[400],
    },
    stepLine: {
        flex: 1,
        height: '3px',
        marginLeft: '8px',
        marginRight: '8px',
        transition: 'all 0.3s ease',
        borderRadius: '2px',
    },
    stepLineActive: {
        background: auroraTheme.primary,
    },
    stepLineInactive: {
        backgroundColor: auroraTheme.colors.gray[200],
    },
    stepLabel: {
        fontSize: '12px',
        marginTop: '8px',
        color: auroraTheme.colors.gray[500],
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[700],
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
        backgroundColor: '#ffffff',
        fontFamily: 'inherit',
    },
    inputFocus: {
        border: `2px solid ${auroraTheme.colors.indigo[500]}`,
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    countryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // Updated to 4 cols for better layout
        gap: '12px',
        marginTop: '12px',
    },
    countryButton: {
        padding: '12px',
        borderRadius: '12px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        backgroundColor: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[700],
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    countryButtonActive: {
        border: `2px solid ${auroraTheme.colors.indigo[500]}`,
        backgroundColor: auroraTheme.colors.indigo[50],
        color: auroraTheme.colors.indigo[700],
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '40px',
        paddingTop: '30px',
        borderTop: '2px solid ' + auroraTheme.colors.gray[100],
    },
    buttonBack: {
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[600],
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    buttonNext: {
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    },
    buttonNextHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none',
    },
};

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setProfileStatus = useUserStore((state) => state.setProfileStatus);
    const [buttonHover, setButtonHover] = useState(false);

    const [formData, setFormData] = useState({
        education_level: '',
        degree: '',
        major: '',
        graduation_year: new Date().getFullYear(),
        gpa: 0,
        intended_degree: '',
        field_of_study: '',
        target_intake_year: new Date().getFullYear() + 1,
        preferred_countries: [] as string[],
        budget_min: 0,
        budget_max: 0,
        funding_type: '',
        ielts_toefl_status: '',
        ielts_toefl_score: null as number | null,
        gre_gmat_status: '',
        gre_gmat_score: null as number | null,
        sop_status: '',
    });

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });
    }, [router]);

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleCountry = (country: string) => {
        setFormData((prev) => ({
            ...prev,
            preferred_countries: prev.preferred_countries.includes(country)
                ? prev.preferred_countries.filter((c) => c !== country)
                : [...prev.preferred_countries, country],
        }));
    };

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.education_level || !formData.degree || !formData.major || formData.gpa === 0) {
                    setError('Please fill in all academic background fields');
                    return false;
                }
                break;
            case 2:
                if (!formData.intended_degree || !formData.field_of_study || formData.preferred_countries.length === 0) {
                    setError('Please complete all study goal fields and select at least one country');
                    return false;
                }
                break;
            case 3:
                if (formData.budget_min === 0 || formData.budget_max === 0 || !formData.funding_type) {
                    setError('Please provide budget information');
                    return false;
                }
                break;
            case 4:
                if (!formData.ielts_toefl_status || !formData.gre_gmat_status || !formData.sop_status) {
                    setError('Please complete all exam and readiness fields');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep((prev) => prev + 1);
            setError('');
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError('');

        try {
            // Use the backend API to save profile
            await apiClient.createProfile(formData);

            setProfileStatus(true, 'PROFILE_READY');
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Singapore', 'Ireland'];
    const examStatuses = ['Not Started', 'Scheduled', 'Completed'];
    const sopStatuses = ['Not Started', 'Draft', 'Ready'];
    const stepTitles = ['Academic', 'Goals', 'Budget', 'Readiness'];

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo}>AI Counsellor</div>
                        <h1 style={styles.title}>Complete Your Profile</h1>
                        <p style={styles.subtitle}>Help us personalize your study abroad journey</p>
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.progressContainer}>
                        {[1, 2, 3, 4].map((step, index) => (
                            <div key={step} style={styles.stepWrapper}>
                                <div style={styles.stepRow}>
                                    <div
                                        style={{
                                            ...styles.stepCircle,
                                            ...(currentStep >= step ? styles.stepCircleActive : styles.stepCircleInactive),
                                        }}
                                    >
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <div
                                            style={{
                                                ...styles.stepLine,
                                                ...(currentStep > step ? styles.stepLineActive : styles.stepLineInactive),
                                            }}
                                        />
                                    )}
                                </div>
                                <p style={styles.stepLabel}>{stepTitles[index]}</p>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <span style={{ fontSize: '18px' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Academic Background */}
                    {currentStep === 1 && (
                        <div>
                            <h2 style={styles.sectionTitle}>Academic Background</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Current Education Level</label>
                                <select
                                    style={styles.input}
                                    value={formData.education_level}
                                    onChange={(e) => updateField('education_level', e.target.value)}
                                >
                                    <option value="">Select level</option>
                                    <option value="High School">High School</option>
                                    <option value="Bachelors">Bachelors</option>
                                    <option value="Masters">Masters</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Degree/Major</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="e.g., Computer Science"
                                        value={formData.degree}
                                        onChange={(e) => updateField('degree', e.target.value)}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Field of Study</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="e.g., Engineering"
                                        value={formData.major}
                                        onChange={(e) => updateField('major', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Graduation Year</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={formData.graduation_year}
                                        onChange={(e) => updateField('graduation_year', parseInt(e.target.value))}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CGPA (on 10 scale)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        style={styles.input}
                                        value={formData.gpa || ''}
                                        onChange={(e) => updateField('gpa', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Study Goals */}
                    {currentStep === 2 && (
                        <div>
                            <h2 style={styles.sectionTitle}>Study Goals</h2>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Intended Degree</label>
                                    <select
                                        style={styles.input}
                                        value={formData.intended_degree}
                                        onChange={(e) => updateField('intended_degree', e.target.value)}
                                    >
                                        <option value="">Select degree</option>
                                        <option value="Bachelors">Bachelors</option>
                                        <option value="Masters">Masters</option>
                                        <option value="PhD">PhD</option>
                                        <option value="Diploma">Diploma</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Field of Study</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="e.g., Data Science"
                                        value={formData.field_of_study}
                                        onChange={(e) => updateField('field_of_study', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Target Intake Year</label>
                                <input
                                    type="number"
                                    style={styles.input}
                                    value={formData.target_intake_year}
                                    onChange={(e) => updateField('target_intake_year', parseInt(e.target.value))}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Preferred Countries (select all that apply)</label>
                                <div style={styles.countryGrid}>
                                    {countries.map((country) => (
                                        <button
                                            key={country}
                                            type="button"
                                            onClick={() => toggleCountry(country)}
                                            style={{
                                                ...styles.countryButton,
                                                ...(formData.preferred_countries.includes(country) ? styles.countryButtonActive : {}),
                                            }}
                                        >
                                            {country}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Budget */}
                    {currentStep === 3 && (
                        <div>
                            <h2 style={styles.sectionTitle}>Budget & Funding</h2>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Annual Budget Min ($)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        placeholder="20000"
                                        value={formData.budget_min || ''}
                                        onChange={(e) => updateField('budget_min', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Annual Budget Max ($)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        placeholder="50000"
                                        value={formData.budget_max || ''}
                                        onChange={(e) => updateField('budget_max', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Funding Type</label>
                                <select
                                    style={styles.input}
                                    value={formData.funding_type}
                                    onChange={(e) => updateField('funding_type', e.target.value)}
                                >
                                    <option value="">Select funding type</option>
                                    <option value="self">Self-Funded</option>
                                    <option value="loan">Education Loan</option>
                                    <option value="scholarship">Scholarship</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Exams & Readiness */}
                    {currentStep === 4 && (
                        <div>
                            <h2 style={styles.sectionTitle}>Exam Preparation & Readiness</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>IELTS/TOEFL Status</label>
                                <select
                                    style={styles.input}
                                    value={formData.ielts_toefl_status}
                                    onChange={(e) => updateField('ielts_toefl_status', e.target.value)}
                                >
                                    <option value="">Select status</option>
                                    {examStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.ielts_toefl_status === 'Completed' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>IELTS/TOEFL Score (optional)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        style={styles.input}
                                        placeholder="7.5"
                                        value={formData.ielts_toefl_score || ''}
                                        onChange={(e) => updateField('ielts_toefl_score', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>GRE/GMAT Status</label>
                                <select
                                    style={styles.input}
                                    value={formData.gre_gmat_status}
                                    onChange={(e) => updateField('gre_gmat_status', e.target.value)}
                                >
                                    <option value="">Select status</option>
                                    {examStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.gre_gmat_status === 'Completed' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>GRE/GMAT Score (optional)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        placeholder="320"
                                        value={formData.gre_gmat_score || ''}
                                        onChange={(e) => updateField('gre_gmat_score', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Statement of Purpose (SOP) Status</label>
                                <select
                                    style={styles.input}
                                    value={formData.sop_status}
                                    onChange={(e) => updateField('sop_status', e.target.value)}
                                >
                                    <option value="">Select status</option>
                                    {sopStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={styles.buttonRow}>
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            style={{
                                ...styles.buttonBack,
                                ...(currentStep === 1 ? styles.buttonDisabled : {}),
                            }}
                        >
                            Back
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                onMouseEnter={() => setButtonHover(true)}
                                onMouseLeave={() => setButtonHover(false)}
                                style={{
                                    ...styles.buttonNext,
                                    ...(buttonHover ? styles.buttonNextHover : {}),
                                }}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                onMouseEnter={() => setButtonHover(true)}
                                onMouseLeave={() => setButtonHover(false)}
                                style={{
                                    ...styles.buttonNext,
                                    ...(buttonHover && !loading ? styles.buttonNextHover : {}),
                                    ...(loading ? styles.buttonDisabled : {}),
                                }}
                            >
                                {loading ? 'Saving...' : 'Complete Profile'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
