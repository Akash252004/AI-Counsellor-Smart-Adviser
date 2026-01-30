'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';
import { auroraTheme } from '@/lib/theme';

interface RecommendedTask {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    icon: string;
}

interface CustomTask {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    category: string;
    is_complete: boolean;
    created_at: string;
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
        marginBottom: '40px',
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: auroraTheme.colors.gray[600],
    },
    section: {
        marginBottom: '40px',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
    },
    addButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        background: auroraTheme.primary,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
    },
    tasksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    taskCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    taskCardHover: {
        border: '2px solid ' + auroraTheme.colors.indigo[300],
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    },
    taskHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '12px',
    },
    taskIcon: {
        fontSize: '24px',
        flexShrink: 0,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: auroraTheme.colors.gray[900],
        marginBottom: '6px',
    },
    taskDescription: {
        fontSize: '14px',
        color: auroraTheme.colors.gray[600],
        lineHeight: '1.5',
    },
    priorityBadge: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
    },
    priorityHigh: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    priorityMedium: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
    priorityLow: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
    },
    customTaskCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid ' + auroraTheme.colors.gray[200],
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.2s ease',
    },
    customTaskCardHover: {
        backgroundColor: auroraTheme.colors.gray[50],
    },
    checkbox: {
        width: '24px',
        height: '24px',
        borderRadius: '8px',
        border: '2px solid ' + auroraTheme.colors.gray[300],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s ease',
    },
    checkboxChecked: {
        background: auroraTheme.primary,
        border: '2px solid transparent',
        color: '#ffffff',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitleSmall: {
        fontSize: '15px',
        fontWeight: '600',
        color: auroraTheme.colors.gray[900],
        marginBottom: '4px',
    },
    taskTitleComplete: {
        textDecoration: 'line-through',
        color: auroraTheme.colors.gray[400],
    },
    taskMeta: {
        fontSize: '13px',
        color: auroraTheme.colors.gray[500],
        display: 'flex',
        gap: '12px',
    },
    deleteButton: {
        padding: '8px',
        fontSize: '16px',
        color: auroraTheme.colors.gray[400],
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    deleteButtonHover: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '60px 20px',
        color: auroraTheme.colors.gray[500],
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    emptyText: {
        fontSize: '16px',
    },
    loading: {
        textAlign: 'center' as const,
        padding: '100px 20px',
        fontSize: '18px',
        color: auroraTheme.colors.gray[600],
    },
    // Modal
    modal: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: auroraTheme.colors.gray[900],
        marginBottom: '24px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
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
        padding: '12px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    textarea: {
        padding: '12px',
        fontSize: '15px',
        border: '2px solid ' + auroraTheme.colors.gray[200],
        borderRadius: '10px',
        outline: 'none',
        minHeight: '100px',
        resize: 'vertical' as const,
        fontFamily: 'inherit',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
    },
    modalButton: {
        flex: 1,
        padding: '14px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    cancelButton: {
        backgroundColor: auroraTheme.colors.gray[100],
        color: auroraTheme.colors.gray[700],
        border: 'none',
    },
    submitButton: {
        background: auroraTheme.primary,
        color: '#ffffff',
        border: 'none',
    },
};

export default function TasksPage() {
    const router = useRouter();
    const [recommendedTasks, setRecommendedTasks] = useState<RecommendedTask[]>([]);
    const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [hoveredDeleteButton, setHoveredDeleteButton] = useState<number | null>(null);
    const hasCacheRef = useRef(false);

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');

    // Load cached data on mount (SSR-safe)
    useEffect(() => {
        const cachedRecommended = localStorage.getItem('recommended_tasks_cache');
        const cachedCustom = localStorage.getItem('custom_tasks_cache');

        if (cachedRecommended || cachedCustom) {
            if (cachedRecommended) {
                try {
                    setRecommendedTasks(JSON.parse(cachedRecommended));
                } catch { }
            }
            if (cachedCustom) {
                try {
                    setCustomTasks(JSON.parse(cachedCustom));
                } catch { }
            }
            setLoading(false);
            hasCacheRef.current = true;
        }
    }, []);

    useEffect(() => {
        authHelpers.getSession().then(({ session }) => {
            if (!session) router.push('/login');
        });
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        // Only show loading if no cached data was loaded
        if (!hasCacheRef.current) setLoading(true);
        try {
            const [recommendedRes, customRes] = await Promise.all([
                apiClient.getRecommendedTasks(),
                apiClient.getCustomTasks(),
            ]);

            setRecommendedTasks(recommendedRes.data.recommended_tasks);
            setCustomTasks(customRes.data.custom_tasks);
            // Cache the data
            localStorage.setItem('recommended_tasks_cache', JSON.stringify(recommendedRes.data.recommended_tasks));
            localStorage.setItem('custom_tasks_cache', JSON.stringify(customRes.data.custom_tasks));
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();

        // Optimistic update - add task locally first
        const tempId = Date.now();
        const newTask: CustomTask = {
            id: tempId,
            title: newTaskTitle,
            description: newTaskDescription,
            due_date: newTaskDueDate || undefined,
            category: newTaskCategory,
            is_complete: false,
            created_at: new Date().toISOString(),
        };

        setCustomTasks(prev => [newTask, ...prev]);

        // Reset form and close modal immediately
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskCategory('general');
        setShowAddModal(false);

        try {
            const response = await apiClient.createCustomTask({
                title: newTask.title,
                description: newTask.description,
                due_date: newTask.due_date || null,
                category: newTask.category,
            });

            // Replace temp task with real one from server
            if (response.data.task) {
                setCustomTasks(prev => prev.map(t => t.id === tempId ? response.data.task : t));
            }
        } catch (error) {
            console.error('Error creating task:', error);
            // Revert optimistic update on error
            setCustomTasks(prev => prev.filter(t => t.id !== tempId));
            alert('Failed to create task');
        }
    };

    const handleToggleComplete = async (taskId: number) => {
        // Optimistic update - toggle locally first
        setCustomTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, is_complete: !task.is_complete } : task
        ));

        try {
            await apiClient.toggleTaskComplete(taskId);
        } catch (error) {
            console.error('Error toggling task:', error);
            // Revert on error
            setCustomTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, is_complete: !task.is_complete } : task
            ));
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        // Direct delete without confirmation as requested


        // Store the task in case we need to restore it
        const taskToDelete = customTasks.find(t => t.id === taskId);

        // Optimistic update - remove locally first
        setCustomTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await apiClient.deleteTask(taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            // Revert on error - add the task back
            if (taskToDelete) {
                setCustomTasks(prev => [...prev, taskToDelete]);
            }
        }
    };

    // Loading handled inline


    return (
        <>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    {loading ? (
                        <div style={styles.loading}>Loading tasks...</div>
                    ) : (
                        <>
                            <div style={styles.header}>
                                <h1 style={styles.title}>Tasks & Reminders</h1>
                                <p style={styles.subtitle}>
                                    Stay organized with recommended tasks and custom reminders
                                </p>
                            </div>

                            {/* Recommended Tasks */}
                            <div style={styles.section}>
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>📋 Recommended Tasks</h2>
                                </div>

                                {recommendedTasks.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <div style={styles.emptyIcon}>✅</div>
                                        <p style={styles.emptyText}>All caught up! No recommendations at the moment.</p>
                                    </div>
                                ) : (
                                    <div style={styles.tasksGrid}>
                                        {recommendedTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                style={{
                                                    ...styles.taskCard,
                                                    ...(hoveredCard === task.id ? styles.taskCardHover : {}),
                                                }}
                                                onMouseEnter={() => setHoveredCard(task.id)}
                                                onMouseLeave={() => setHoveredCard(null)}
                                            >
                                                <div style={styles.taskHeader}>
                                                    <span style={styles.taskIcon}>{task.icon}</span>
                                                    <div style={styles.taskContent}>
                                                        <h3 style={styles.taskTitle}>{task.title}</h3>
                                                        <span
                                                            style={{
                                                                ...styles.priorityBadge,
                                                                ...(task.priority === 'high' ? styles.priorityHigh : {}),
                                                                ...(task.priority === 'medium' ? styles.priorityMedium : {}),
                                                                ...(task.priority === 'low' ? styles.priorityLow : {}),
                                                            }}
                                                        >
                                                            {task.priority} Priority
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={styles.taskDescription}>{task.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Tasks */}
                            <div style={styles.section}>
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>✏️ My Custom Tasks</h2>
                                    <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
                                        + Add Task
                                    </button>
                                </div>

                                {customTasks.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <div style={styles.emptyIcon}>📝</div>
                                        <p style={styles.emptyText}>No custom tasks yet. Click "Add Task" to create one!</p>
                                    </div>
                                ) : (
                                    customTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            style={{
                                                ...styles.customTaskCard,
                                                ...(hoveredCard === `custom-${task.id}` ? styles.customTaskCardHover : {}),
                                            }}
                                            onMouseEnter={() => setHoveredCard(`custom-${task.id}`)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            <div
                                                style={{
                                                    ...styles.checkbox,
                                                    ...(task.is_complete ? styles.checkboxChecked : {}),
                                                }}
                                                onClick={() => handleToggleComplete(task.id)}
                                            >
                                                {task.is_complete && '✓'}
                                            </div>

                                            <div style={styles.taskInfo}>
                                                <div
                                                    style={{
                                                        ...styles.taskTitleSmall,
                                                        ...(task.is_complete ? styles.taskTitleComplete : {}),
                                                    }}
                                                >
                                                    {task.title}
                                                </div>
                                                <div style={styles.taskMeta}>
                                                    {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                                                    <span>📂 {task.category}</span>
                                                </div>
                                            </div>

                                            <button
                                                style={{
                                                    ...styles.deleteButton,
                                                    ...(hoveredDeleteButton === task.id ? styles.deleteButtonHover : {}),
                                                }}
                                                onMouseEnter={() => setHoveredDeleteButton(task.id)}
                                                onMouseLeave={() => setHoveredDeleteButton(null)}
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddModal && (
                <div style={styles.modal} onClick={() => setShowAddModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Add Custom Task</h2>

                        <form style={styles.form} onSubmit={handleAddTask}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Task Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Submit visa application"
                                    style={styles.input}
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    placeholder="Add details about this task..."
                                    style={styles.textarea}
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Due Date</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Category</label>
                                <select
                                    style={styles.input}
                                    value={newTaskCategory}
                                    onChange={(e) => setNewTaskCategory(e.target.value)}
                                >
                                    <option value="general">General</option>
                                    <option value="exam">Exam</option>
                                    <option value="application">Application</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    style={{ ...styles.modalButton, ...styles.cancelButton }}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ ...styles.modalButton, ...styles.submitButton }}
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
