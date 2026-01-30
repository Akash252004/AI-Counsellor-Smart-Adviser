'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

type Section = 'academic' | 'goals' | 'budget' | 'exams' | 'personal';

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
    layout: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
    },
    sidebar: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        height: 'fit-content',
        position: 'sticky' as const,
        top: '84px',
        boxShadow: auroraTheme.shadows.md,
    },
    sidebarTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '20px',
    },
    sidebarMenu: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    menuItem: {
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        color: auroraTheme.colors.gray[600],
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    menuItemActive: {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        color: auroraTheme.colors.indigo[600],
        fontWeight: '600',
    },
    menuItemHover: {
        backgroundColor: auroraTheme.colors.gray[50],
    },
    menuIcon: {
        fontSize: '20px',
    },
    content: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: auroraTheme.shadows.md,
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
    },
    contentTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
        marginBottom: '8px',
    },
    contentSubtitle: {
        fontSize: '15px',
        color: auroraTheme.colors.gray[600],
    },
    editButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: auroraTheme.colors.indigo[600],
        backgroundColor: auroraTheme.colors.indigo[50],
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
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
    select: {
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '10px',
        outline: 'none',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
    },
    viewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
    },
    viewItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
    },
    viewLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[500],
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    viewValue: {
        fontSize: '16px',
        fontWeight: '500',
        color: auroraTheme.colors.gray[900],
        minHeight: '24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    actionButtons: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
    },
    saveButton: {
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    cancelButton: {
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[600],
        background: auroraTheme.colors.gray[100],
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    infoCard: {
        backgroundColor: auroraTheme.colors.indigo[50],
        border: '1px solid ' + auroraTheme.colors.indigo[200],
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
    },
    infoText: {
        fontSize: '14px',
        color: auroraTheme.colors.indigo[700],
        lineHeight: '1.6',
    },
    loading: {
        textAlign: 'center' as const,
        padding: '100px 20px',
        fontSize: '18px',
        color: auroraTheme.colors.gray[600],
    },
};

export default function ProfilePage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<Section>('academic');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<Section | null>(null);

    // Form state
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });
        fetchProfile();
    }, []);

    // Reset editing state when switching sections
    useEffect(() => {
        setIsEditing(false);
        // Reset form data to current profile to discard unsaved changes
        if (profile) {
            setFormData(profile);
        }
    }, [activeSection, profile]);

    const fetchProfile = async () => {
        try {
            setError(null);
            const response = await apiClient.getProfile();
            if (response.data.profile) {
                setProfile(response.data.profile);
                setFormData(response.data.profile);
            } else {
                setProfile({});
                setFormData({});
                // If profile is empty, start in edit mode for academic section
                setIsEditing(true);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            if (error.response && error.response.status === 404) {
                setProfile({});
                setFormData({});
                setIsEditing(true);
            } else {
                setError('Failed to load profile. Please refresh or try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const gradDate = formData.graduation_date
                ? new Date(formData.graduation_date)
                : new Date();

            const payload = {
                // Academic
                education_level: formData.education_level || formData.current_education || 'Undergraduate',
                degree: formData.degree || 'Bachelor',
                major: formData.major || formData.current_field || 'General',
                graduation_year: gradDate.getFullYear(),
                gpa: parseFloat(formData.gpa || '0'),

                // Goals
                intended_degree: formData.intended_degree || formData.target_degree || 'Masters',
                field_of_study: formData.field_of_study || formData.field || 'Computer Science',
                target_intake_year: parseInt(formData.target_intake_year || formData.target_intake || '2026'),
                preferred_countries: formData.preferred_countries || ['USA', 'UK', 'Canada', 'Australia'],

                // Budget
                budget_min: formData.budget_min || 0,
                budget_max: formData.budget_max || 50000,
                funding_type: formData.funding_type || 'Self-funded',

                // Personal (Optional)
                family_income: formData.family_income || null,
                father_occupation: formData.father_occupation || null,
                mother_occupation: formData.mother_occupation || null,
                father_name: formData.father_name || null,
                mother_name: formData.mother_name || null,
                siblings_count: formData.siblings_count ?? null,
                sibling_details: formData.sibling_details || null,

                // Documents (Optional)
                sop_url: formData.sop_url || null,
                lor_url: formData.lor_url || null,

                // Exams
                ielts_toefl_status: formData.ielts_toefl_status || 'Not taken',
                ielts_toefl_score: formData.ielts_toefl_score ? parseFloat(formData.ielts_toefl_score) : null,
                gre_gmat_status: formData.gre_gmat_status || 'Not taken',
                gre_gmat_score: formData.gre_gmat_score ? parseFloat(formData.gre_gmat_score) : null,
                sop_status: formData.sop_status || 'Not started'
            };

            // Use upsert/create logic
            if (!profile || !profile.id) {
                await apiClient.createProfile(payload);
            } else {
                await apiClient.updateProfile(payload);
            }

            // Sync state locally immediately for better UX
            setProfile({ ...profile, ...payload, ...formData });
            setIsEditing(false); // Switch back to View mode

            // Background refresh to be safe
            fetchProfile();

        } catch (error: any) {
            console.error('Error saving profile:', error);
            const msg = error.response?.data?.detail
                ? JSON.stringify(error.response.data.detail)
                : 'Failed to save profile. Please check all fields.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(profile); // Revert changes
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const menuItems = [
        { id: 'academic' as Section, icon: '📚', label: 'Academic Background' },
        { id: 'goals' as Section, icon: '🎯', label: 'Study Goals' },
        { id: 'budget' as Section, icon: '💰', label: 'Budget & Funding' },
        { id: 'exams' as Section, icon: '📝', label: 'Exams & Readiness' },
        { id: 'personal' as Section, icon: '👨‍👩‍👧‍👦', label: 'Personal Details (Optional)' },
    ];

    const HeaderWithEdit = ({ title, subtitle }: { title: string, subtitle: string }) => (
        <div style={styles.headerRow}>
            <div>
                <h2 style={styles.contentTitle}>{title}</h2>
                <p style={styles.contentSubtitle}>{subtitle}</p>
            </div>
            {!isEditing && (
                <button style={styles.editButton} onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                </button>
            )}
        </div>
    );

    const ViewItem = ({ label, value }: { label: string, value: string | number | null | undefined }) => (
        <div style={styles.viewItem}>
            <span style={styles.viewLabel}>{label}</span>
            <span style={styles.viewValue}>{value || '—'}</span>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'academic':
                return (
                    <>
                        <HeaderWithEdit
                            title="Academic Background"
                            subtitle="Your current education level and qualifications"
                        />

                        {isEditing ? (
                            <div style={styles.form}>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Current Education Level *</label>
                                        <select
                                            style={styles.select}
                                            value={formData.education_level || formData.current_education || ''}
                                            onChange={(e) => handleInputChange('education_level', e.target.value)}
                                        >
                                            <option value="">Select level</option>
                                            <option value="High School">High School</option>
                                            <option value="Undergraduate">Undergraduate</option>
                                            <option value="Postgraduate">Postgraduate</option>
                                            <option value="PhD">PhD</option>
                                        </select>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Degree / Major *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., B.Tech Computer Science"
                                            style={styles.input}
                                            value={formData.major || formData.current_field || ''}
                                            onChange={(e) => handleInputChange('major', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>CGPA (out of 10) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g., 8.5"
                                            style={styles.input}
                                            value={formData.gpa || ''}
                                            onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Graduation Year *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 2024"
                                            style={styles.input}
                                            value={formData.graduation_year || ''}
                                            onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div style={styles.actionButtons}>
                                    <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button style={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.viewGrid}>
                                <ViewItem label="Education Level" value={profile?.education_level || profile?.current_education} />
                                <ViewItem label="Degree / Major" value={profile?.major || profile?.current_field} />
                                <ViewItem label="CGPA (out of 10)" value={profile?.gpa} />
                                <ViewItem label="Graduation Year" value={profile?.graduation_year} />
                            </div>
                        )}
                    </>
                );

            case 'goals':
                return (
                    <>
                        <HeaderWithEdit
                            title="Study Goals"
                            subtitle="What you want to pursue abroad"
                        />

                        {isEditing ? (
                            <div style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Intended Degree *</label>
                                    <select
                                        style={styles.select}
                                        value={formData.intended_degree || formData.target_degree || ''}
                                        onChange={(e) => handleInputChange('intended_degree', e.target.value)}
                                    >
                                        <option value="">Select degree</option>
                                        <option value="Bachelors">Bachelors</option>
                                        <option value="Masters">Masters</option>
                                        <option value="MBA">MBA</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Field of Study *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Data Science, Business Analytics"
                                        style={styles.input}
                                        value={formData.field_of_study || formData.field || ''}
                                        onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                                    />
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Target Intake Year *</label>
                                        <select
                                            style={styles.select}
                                            value={formData.target_intake_year || formData.target_intake || ''}
                                            onChange={(e) => handleInputChange('target_intake_year', parseInt(e.target.value))}
                                        >
                                            <option value="">Select intake</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Preferred Country *</label>
                                        <select
                                            style={styles.select}
                                            onChange={(e) => handleInputChange('preferred_countries', [e.target.value])}
                                            value={formData.preferred_countries?.[0] || ''}
                                        >
                                            <option value="">Select primary preference</option>
                                            <option value="USA">USA</option>
                                            <option value="UK">UK</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button style={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.viewGrid}>
                                <ViewItem label="Intended Degree" value={profile?.intended_degree || profile?.target_degree} />
                                <ViewItem label="Field of Study" value={profile?.field_of_study || profile?.field} />
                                <ViewItem label="Target Intake" value={profile?.target_intake_year || profile?.target_intake} />
                                <ViewItem label="Preferred Countries" value={profile?.preferred_countries?.join(', ')} />
                            </div>
                        )}
                    </>
                );

            case 'budget':
                return (
                    <>
                        <HeaderWithEdit
                            title="Budget & Funding"
                            subtitle="Financial planning for your education"
                        />

                        {isEditing ? (
                            <div style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Max Budget per Year (USD) *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 50000"
                                        style={styles.input}
                                        value={formData.budget_max || ''}
                                        onChange={(e) => handleInputChange('budget_max', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Funding Plan *</label>
                                    <select
                                        style={styles.select}
                                        value={formData.funding_type || ''}
                                        onChange={(e) => handleInputChange('funding_type', e.target.value)}
                                    >
                                        <option value="">Select plan</option>
                                        <option value="Self-funded">Self-funded</option>
                                        <option value="Scholarship-dependent">Scholarship-dependent</option>
                                        <option value="Loan-dependent">Loan-dependent</option>
                                    </select>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button style={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.viewGrid}>
                                <ViewItem label="Max Budget (Yearly)" value={profile?.budget_max ? `$${profile.budget_max}` : 'Not set'} />
                                <ViewItem label="Funding Plan" value={profile?.funding_type} />
                            </div>
                        )}
                    </>
                );

            case 'exams':
                return (
                    <>
                        <HeaderWithEdit
                            title="Exams & Readiness"
                            subtitle="Test scores and application documents status"
                        />

                        {isEditing ? (
                            <div style={styles.form}>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>IELTS/TOEFL Status</label>
                                        <select
                                            style={styles.select}
                                            value={formData.ielts_toefl_status || ''}
                                            onChange={(e) => handleInputChange('ielts_toefl_status', e.target.value)}
                                        >
                                            <option value="Not taken">Not taken</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Score (if taken)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            placeholder="e.g., 7.5"
                                            style={styles.input}
                                            value={formData.ielts_toefl_score || ''}
                                            onChange={(e) => handleInputChange('ielts_toefl_score', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>GRE/GMAT Status</label>
                                        <select
                                            style={styles.select}
                                            value={formData.gre_gmat_status || ''}
                                            onChange={(e) => handleInputChange('gre_gmat_status', e.target.value)}
                                        >
                                            <option value="Not taken">Not taken</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Score (if taken)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 320"
                                            style={styles.input}
                                            value={formData.gre_gmat_score || ''}
                                            onChange={(e) => handleInputChange('gre_gmat_score', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>SOP Status</label>
                                    <select
                                        style={styles.select}
                                        value={formData.sop_status || ''}
                                        onChange={(e) => handleInputChange('sop_status', e.target.value)}
                                    >
                                        <option value="Not started">Not started</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Ready">Ready</option>
                                    </select>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button style={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.viewGrid}>
                                <ViewItem label="IELTS/TOEFL Status" value={profile?.ielts_toefl_status} />
                                <ViewItem label="IELTS/TOEFL Score" value={profile?.ielts_toefl_score} />
                                <ViewItem label="GRE/GMAT Status" value={profile?.gre_gmat_status} />
                                <ViewItem label="GRE/GMAT Score" value={profile?.gre_gmat_score} />
                                <ViewItem label="SOP Status" value={profile?.sop_status} />
                            </div>
                        )}
                    </>
                );

            case 'personal':
                return (
                    <>
                        <HeaderWithEdit
                            title="Personal Details"
                            subtitle="Optional family information (not mandatory)"
                        />

                        {isEditing ? (
                            <div style={styles.form}>
                                <div style={{ ...styles.infoCard, marginBottom: '24px' }}>
                                    <p style={styles.infoText}>
                                        ℹ️ All fields in this section are <strong>optional</strong>. You can skip any field you don't want to fill.
                                    </p>
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Father's Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter father's name"
                                            style={styles.input}
                                            value={formData.father_name || ''}
                                            onChange={(e) => handleInputChange('father_name', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Mother's Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter mother's name"
                                            style={styles.input}
                                            value={formData.mother_name || ''}
                                            onChange={(e) => handleInputChange('mother_name', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Father's Occupation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Engineer, Business, Teacher"
                                            style={styles.input}
                                            value={formData.father_occupation || ''}
                                            onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Mother's Occupation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Homemaker, Doctor, Teacher"
                                            style={styles.input}
                                            value={formData.mother_occupation || ''}
                                            onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Annual Family Income</label>
                                    <select
                                        style={styles.select}
                                        value={formData.family_income || ''}
                                        onChange={(e) => handleInputChange('family_income', e.target.value)}
                                    >
                                        <option value="">Select income range</option>
                                        <option value="Below 5 Lakhs">Below 5 Lakhs</option>
                                        <option value="5-10 Lakhs">5-10 Lakhs</option>
                                        <option value="10-15 Lakhs">10-15 Lakhs</option>
                                        <option value="15-25 Lakhs">15-25 Lakhs</option>
                                        <option value="25-50 Lakhs">25-50 Lakhs</option>
                                        <option value="Above 50 Lakhs">Above 50 Lakhs</option>
                                    </select>
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Number of Siblings</label>
                                        <select
                                            style={styles.select}
                                            value={formData.siblings_count ?? ''}
                                            onChange={(e) => handleInputChange('siblings_count', e.target.value ? parseInt(e.target.value) : null)}
                                        >
                                            <option value="">Select</option>
                                            <option value="0">None (Only Child)</option>
                                            <option value="1">1 Sibling</option>
                                            <option value="2">2 Siblings</option>
                                            <option value="3">3 Siblings</option>
                                            <option value="4">4+ Siblings</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Sibling Details (Optional)</label>
                                    <textarea
                                        placeholder="e.g., Elder brother studying MBA in USA, Younger sister in 10th grade"
                                        style={{ ...styles.input, minHeight: '80px', resize: 'vertical' as const }}
                                        value={formData.sibling_details || ''}
                                        onChange={(e) => handleInputChange('sibling_details', e.target.value)}
                                    />
                                </div>

                                <div style={styles.actionButtons}>
                                    <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button style={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.viewGrid}>
                                <ViewItem label="Father's Name" value={profile?.father_name} />
                                <ViewItem label="Mother's Name" value={profile?.mother_name} />
                                <ViewItem label="Father's Occupation" value={profile?.father_occupation} />
                                <ViewItem label="Mother's Occupation" value={profile?.mother_occupation} />
                                <ViewItem label="Family Income" value={profile?.family_income} />
                                <ViewItem label="Number of Siblings" value={profile?.siblings_count !== null && profile?.siblings_count !== undefined ? String(profile.siblings_count) : null} />
                                <ViewItem label="Sibling Details" value={profile?.sibling_details} />
                            </div>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.loading}>Loading profile...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.layout}>
                        {/* Sidebar */}
                        <div style={styles.sidebar}>
                            <h3 style={styles.sidebarTitle}>Profile Settings</h3>
                            <div style={styles.sidebarMenu}>
                                {menuItems.map((item) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            ...styles.menuItem,
                                            ...(activeSection === item.id ? styles.menuItemActive : {}),
                                            ...(hoveredItem === item.id && activeSection !== item.id ? styles.menuItemHover : {}),
                                        }}
                                        onClick={() => setActiveSection(item.id)}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <span style={styles.menuIcon}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={styles.content}>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
