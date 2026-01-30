'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        background: 'linear-gradient(to bottom, #f0f4f8, #ffffff)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky' as const,
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    headerContainer: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backLink: {
        color: '#0891b2',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logo: {
        fontSize: '32px',
    },
    titleSection: {},
    title: {
        fontSize: '22px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #0891b2 0%, #7dd3fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '2px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#6b7280',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
    },
    messagesInner: {
        maxWidth: '900px',
        margin: '0 auto',
    },
    welcome: {
        textAlign: 'center' as const,
        padding: '60px 20px',
    },
    welcomeEmoji: {
        fontSize: '80px',
        marginBottom: '20px',
    },
    welcomeTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#102a43',
        marginBottom: '10px',
    },
    welcomeText: {
        fontSize: '15px',
        color: '#6b7280',
        marginBottom: '40px',
    },
    suggestedTitle: {
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '16px',
    },
    suggestedGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        maxWidth: '700px',
        margin: '0 auto',
    },
    suggestedButton: {
        padding: '14px',
        textAlign: 'left' as const,
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
    },
    messageRow: {
        display: 'flex',
        marginBottom: '24px',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowAssistant: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: '16px 20px',
        borderRadius: '16px',
    },
    messageBubbleUser: {
        background: 'linear-gradient(135deg, #0891b2 0%, #7dd3fc 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)',
    },
    messageBubbleAssistant: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        color: '#374151',
    },
    messageContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
    },
    messageEmoji: {
        fontSize: '24px',
        flexShrink: 0,
    },
    messageText: {
        whiteSpace: 'pre-wrap' as const,
        lineHeight: '1.6',
        fontSize: '14px',
    },
    messageTime: {
        fontSize: '11px',
        marginTop: '8px',
        opacity: 0.7,
    },
    loadingDots: {
        display: 'flex',
        gap: '6px',
        padding: '10px 0',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#0891b2',
        animation: 'bounce 1.4s infinite ease-in-out both',
    },
    inputContainer: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        position: 'sticky' as const,
        bottom: 0,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)',
    },
    inputInner: {
        maxWidth: '1400px', // Widened from 900px
        margin: '0 auto',
        padding: '20px',
    },
    form: {
        display: 'flex',
        gap: '12px',
    },
    input: {
        width: '100%',        // Force fully expand to container
        boxSizing: 'border-box' as const, // Prevent padding overflow
        flex: 1,
        padding: '16px 24px',
        fontSize: '16px',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#f9fafb',
    },
    inputFocus: {
        border: '2px solid #0891b2', // Use full shorthand to match base style
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)',
    },
    sendButton: {
        padding: '16px 32px', // Matches new input height
        fontSize: '16px',
        fontWeight: '700',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #0891b2 0%, #7dd3fc 100%)',
        border: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
    },
    sendButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(8, 145, 178, 0.4)',
    },
    sendButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
    },
    disclaimer: {
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center' as const,
        marginTop: '12px',
    },
    loader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #0891b2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

export default function AICounsellorPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false); // Changed to false - no loading spinner
    const [inputFocused, setInputFocused] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const [userName, setUserName] = useState('');
    const [profileSummary, setProfileSummary] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initializePage();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const checkAuthAndLoadProfile = async () => {
        const { session } = await authHelpers.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        // Fetch user profile for personalized greeting
        try {
            const response = await apiClient.getDashboard();

            // Block access if profile is not ready
            if (response.data.profile_ready === false) {
                router.replace('/profile');
                return;
            }

            const profile = response.data.profile_summary;

            if (profile) {
                // Extract user name
                const name = profile.full_name ||
                    session.user?.user_metadata?.name ||
                    session.user?.email?.split('@')[0]?.split(/[._-]/)[0] || 'there';
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                setUserName(formattedName);

                // Build profile summary for display
                const summaryParts = [];
                if (profile.major) summaryParts.push(`studying ${profile.major}`);
                if (profile.intended_degree) summaryParts.push(`aiming for ${profile.intended_degree}`);
                if (profile.preferred_countries?.length) {
                    summaryParts.push(`interested in ${profile.preferred_countries.slice(0, 2).join(', ')}`);
                }
                setProfileSummary(summaryParts.join(', '));
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            // Fallback to email-based name
            const emailName = session.user?.email?.split('@')[0] || '';
            const cleanName = emailName.split(/[._-]/)[0];
            setUserName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() || 'there');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage((prev) => prev ? prev + ' ' + transcript : transcript);
            };

            recognition.start();
        } else {
            alert("Voice input is not supported in this browser.");
        }
    };

    const speakMessage = (text: string, id: string) => {
        if ('speechSynthesis' in window) {
            if (isSpeaking === id) {
                window.speechSynthesis.cancel();
                setIsSpeaking(null);
                return;
            }
            window.speechSynthesis.cancel();

            // Clean text (remove markdown stars, hashes)
            const cleanText = text.replace(/[*#]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);

            utterance.onend = () => setIsSpeaking(null);
            setIsSpeaking(id);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || loading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await apiClient.sendMessage(inputMessage);
            const aiMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date(response.data.timestamp),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err: any) {
            console.error('Error sending message:', err);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const initializePage = async () => {
        const { session } = await authHelpers.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        await Promise.all([
            loadProfile(session),
            loadSessionChatHistory(session)
        ]);
    };

    const loadProfile = async (session: any) => {
        try {
            const response = await apiClient.getDashboard();
            const profile = response.data.profile_summary;

            if (profile) {
                const name = profile.full_name ||
                    session.user?.user_metadata?.name ||
                    session.user?.email?.split('@')[0]?.split(/[._-]/)[0] || 'there';
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                setUserName(formattedName);

                const summaryParts = [];
                if (profile.major) summaryParts.push(`studying ${profile.major}`);
                if (profile.intended_degree) summaryParts.push(`aiming for ${profile.intended_degree}`);
                if (profile.preferred_countries?.length) {
                    summaryParts.push(`interested in ${profile.preferred_countries.slice(0, 2).join(', ')}`);
                }
                setProfileSummary(summaryParts.join(', '));
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            const emailName = session.user?.email?.split('@')[0] || '';
            const cleanName = emailName.split(/[._-]/)[0];
            setUserName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() || 'there');
        }
    };

    const loadSessionChatHistory = async (session: any) => {
        try {
            const lastLogin = session.user?.last_sign_in_at;
            const response = await apiClient.getChatHistory(50, lastLogin);
            const history = response.data.history || [];

            if (history.length > 0) {
                const formattedMessages: Message[] = [];
                history.reverse().forEach((item: any) => {
                    formattedMessages.push({
                        id: `user-${item.id}`,
                        role: 'user',
                        content: item.message,
                        timestamp: new Date(item.timestamp),
                    });
                    if (item.response) {
                        formattedMessages.push({
                            id: `assistant-${item.id}`,
                            role: 'assistant',
                            content: item.response,
                            timestamp: new Date(item.timestamp),
                        });
                    }
                });
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    const suggestedQuestions = [
        'What universities would you recommend for me?',
        'How can I improve my profile strength?',
        'What should I focus on right now?',
        'Help me with my SOP',
    ];

    const handleSuggestedQuestion = (question: string) => {
        setInputMessage(question);
    };

    if (initialLoading) {
        return (
            <div style={styles.loader}>
                <div style={styles.spinner} />
                <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.headerContainer}>
                    <Link href="/dashboard" style={styles.backLink}>
                        ← Back
                    </Link>
                    <div style={styles.headerTitle}>
                        <span style={styles.logo}>🤖</span>
                        <div style={styles.titleSection}>
                            <h1 style={styles.title}>AI Counsellor</h1>
                            <p style={styles.subtitle}>Your personalized study abroad guide</p>
                        </div>
                    </div>
                    <div style={{ width: '60px' }} /> {/* Spacer for centering */}
                </div>
            </div>

            <div style={styles.messagesContainer}>
                <div style={styles.messagesInner}>
                    {messages.length === 0 && (
                        <div style={styles.welcome}>
                            <div style={styles.welcomeEmoji}>🤖</div>
                            <h2 style={styles.welcomeTitle}>
                                Hi{userName ? ` ${userName}` : ''}! I'm your AI Counsellor
                            </h2>
                            <p style={styles.welcomeText}>
                                {profileSummary ? (
                                    <>I can see you're {profileSummary}. I have access to your complete profile and can give you personalized guidance!</>
                                ) : (
                                    <>I'm here to help you with your study abroad journey. I have access to your profile and can give you personalized advice!</>
                                )}
                            </p>

                            <p style={styles.suggestedTitle}>Try asking:</p>
                            <div style={styles.suggestedGrid}>
                                {suggestedQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedQuestion(question)}
                                        style={styles.suggestedButton}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#0891b2';
                                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                ...styles.messageRow,
                                ...(message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant),
                            }}
                        >
                            <div
                                style={{
                                    ...styles.messageBubble,
                                    ...(message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant),
                                }}
                            >
                                <div style={styles.messageContent}>
                                    {message.role === 'assistant' && <span style={styles.messageEmoji}>🤖</span>}
                                    <div style={{ flex: 1 }}>
                                        <p style={styles.messageText}>{message.content}</p>
                                        <p style={styles.messageTime}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {message.role === 'assistant' && (
                                                <button
                                                    onClick={() => speakMessage(message.content, message.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        marginLeft: '8px',
                                                        fontSize: '14px',
                                                        opacity: 0.7
                                                    }}
                                                    title="Read Aloud"
                                                >
                                                    {isSpeaking === message.id ? '🔊' : '🔈'}
                                                </button>
                                            )}
                                        </p>
                                    </div>
                                    {message.role === 'user' && <span style={styles.messageEmoji}>👤</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ ...styles.messageRow, ...styles.messageRowAssistant }}>
                            <div style={{ ...styles.messageBubble, ...styles.messageBubbleAssistant }}>
                                <div style={styles.messageContent}>
                                    <span style={styles.messageEmoji}>🤖</span>
                                    <div style={styles.loadingDots}>
                                        <div style={{ ...styles.dot, animationDelay: '-0.32s' }} />
                                        <div style={{ ...styles.dot, animationDelay: '-0.16s' }} />
                                        <div style={styles.dot} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div style={styles.inputContainer}>
                <div style={styles.inputInner}>
                    <form onSubmit={handleSendMessage} style={styles.form}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask me anything..."
                                style={{
                                    ...styles.input,
                                    ...(inputFocused ? styles.inputFocus : {}),
                                    padding: '16px 50px 16px 24px' // Explicit padding to avoid shorthand conflict
                                }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    opacity: isListening ? 1 : 0.5,
                                    color: isListening ? '#ef4444' : '#6b7280'
                                }}
                                title="Voice Input"
                            >
                                {isListening ? '🔴' : '🎤'}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !inputMessage.trim()}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                            style={{
                                ...styles.sendButton,
                                ...(buttonHover && !loading && inputMessage.trim() ? styles.sendButtonHover : {}),
                                ...(loading || !inputMessage.trim() ? styles.sendButtonDisabled : {}),
                            }}
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </form>
                    <p style={styles.disclaimer}>
                        AI responses are generated based on your profile and may not always be accurate. Please verify important
                        information.
                    </p>
                </div>
            </div>

            <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        @media (max-width: 768px) {
          .suggested-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
