import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Production-ready Supabase Auth helpers
 * Uses Supabase Auth API (auth.users) - passwords managed securely by Supabase
 */
export const authHelpers = {
  /**
   * Sign up new user
   * Creates entry in auth.users (with encrypted password)
   * Trigger automatically creates matching public.users entry
   */
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Stored in auth.users.raw_user_meta_data, used by trigger
        },
      },
    });

    return { data, error };
  },

  /**
   * Sign in existing user
   * Validates against auth.users (Supabase Auth)
   * Returns session token if credentials valid
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  /**
   * Sign in with Google (OAuth)
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    return { data, error };
  },

  /**
   * Sign out current user
   * Clears session
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    // Clear application cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_cache');
      localStorage.removeItem('shortlist_counts_cache');
      localStorage.removeItem('dashboard_username');
    }
    return { error };
  },

  /**
   * Get current session
   * Returns null if not authenticated
   */
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    return { session, user, error };
  },

  /**
   * Get current user
   * Returns null if not authenticated
   */
  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },
  /**
   * Send OTP to email (for password reset or magic link)
   */
  async signInWithOtp(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create new users on forgot password
      }
    });
    return { data, error };
  },

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  },

  /**
   * Update user details (e.g., password)
   */
  async updateUser(attributes: any) {
    const { data, error } = await supabase.auth.updateUser(attributes);
    return { data, error };
  },

  /**
   * Resend confirmation email
   * Used if the user didn't receive the initial signup verification email
   */
  async resendVerificationEmail(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  },
};

/**
 * Get access token for API calls
 * Used for authenticated requests to backend
 */
export async function getAccessToken(): Promise<string | null> {
  const { session } = await authHelpers.getSession();
  return session?.access_token || null;
}
