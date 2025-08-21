'use client'; // ensure this only runs in the browser (Next.js)
import { createClient } from '@supabase/supabase-js'
import type { User } from "./types"

// Initialize Supabase client
const supabaseUrl = 'https://oedkzwoxhvitsbarbnck.supabase.co';
const supabaseAnonKey =   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGt6d294aHZpdHNiYXJibmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzQ5MzksImV4cCI6MjA3MTM1MDkzOX0.Ypmq463kK0Iwq1mYWfqrxzTv-qoPBSxzWV-zE8XOZlk';


// Safe console logging function
const safeLog = {
  error: (message: string, error?: any) => {
    if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
      console.error(message, error);
    }
  },
  log: (message: string, data?: any) => {
    if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.log) {
      console.log(message, data);
    }
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  safeLog.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Supabase authentication functions
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      safeLog.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        safeLog.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        safeLog.error('Login failed - no user data');
        return { success: false, error: "Login failed" };
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        safeLog.error('Profile fetch error:', profileError);
        return { success: false, error: profileError.message };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name || data.user.user_metadata?.name || data.user.email!,
        role: profile.role || 'buyer',
        createdAt: new Date(profile.created_at || data.user.created_at || Date.now()),
        updatedAt: new Date(profile.updated_at || data.user.updated_at || Date.now())
      };

      // Store user in localStorage for persistence
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("auth_user", JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error) {
      safeLog.error('Unexpected login error:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      safeLog.log('Attempting signup with:', { email, name });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      safeLog.log('Auth signup response:', { data, error });

      if (error) {
        safeLog.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        safeLog.error('Signup failed - no user data');
        return { success: false, error: "Signup failed" };
      }

      safeLog.log('Attempting to create profile for user:', data.user.id);
      
      // Create user profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            name: name,
            role: 'buyer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      safeLog.log('Profile creation result:', { profileError });

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: name,
        role: 'buyer',
        createdAt: new Date(data.user.created_at || Date.now()),
        updatedAt: new Date(data.user.updated_at || Date.now())
      };

      // Even if profile insert failed, keep auth success
      if (profileError) {
        safeLog.error('Profile creation error:', profileError);
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auth_user', JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error) {
      safeLog.error('Unexpected signup error:', error);
      return { success: false, error: "An unexpected error occurred during signup" };
    }
  },
  
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('auth_user');
      }
    } catch (error) {
      safeLog.error('Logout error:', error);
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = window.localStorage.getItem('auth_user');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      safeLog.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Additional method to get the current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      safeLog.error('Error getting session:', error);
      return null;
    }
  },

  // Additional method to listen for auth state changes
  onAuthStateChange(callback: any) {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      safeLog.error('Error setting up auth state listener:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};