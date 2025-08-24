'use client'; // ensure this only runs in the browser (Next.js)
import { supabase } from './supabase-client';
import type { User, UserRole } from "./types"


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

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Role-based access control
export const ROLES = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewAuctions: true,
    canPlaceBids: true,
    canMakePurchases: true,
    canSubmitCustomRequests: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
  },
  [ROLES.ADMIN]: {
    canViewAuctions: true,
    canPlaceBids: true,
    canMakePurchases: true,
    canSubmitCustomRequests: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canViewAllUsers: true,
    canEditAllUsers: true,
    canViewAllAuctions: true,
    canEditAllAuctions: true,
    canViewAllPurchases: true,
    canViewAllLeads: true,
    canViewAllCustomRequests: true,
    canManageCategories: true,
    canManageTags: true,
    canViewAnalytics: true,
    canAccessAdminPanel: true,
  },
} as const;

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
        display_name: profile.display_name || data.user.user_metadata?.name || data.user.email!,
        role: profile.role || 'user',
        created_at: new Date(profile.created_at || data.user.created_at || Date.now()),
        updated_at: new Date(profile.updated_at || data.user.updated_at || Date.now())
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

  async signup(email: string, password: string, name: string, role: UserRole = 'user'): Promise<AuthResponse> {
    try {
      safeLog.log('Attempting signup with:', { email, name, role });
      
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
            display_name: name,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      safeLog.log('Profile creation result:', { profileError });

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        display_name: name,
        role: role,
        created_at: new Date(data.user.created_at || Date.now()),
        updated_at: new Date(data.user.updated_at || Date.now())
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
  },

  // Role-based access control methods
  hasRole(user: User | null, requiredRole: Role | Role[]): boolean {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role as Role);
    }
    
    return user.role === requiredRole;
  },

  hasPermission(user: User | null, permission: keyof typeof ROLE_PERMISSIONS[Role]): boolean {
    if (!user) return false;
    
    const userRole = user.role as Role;
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) return false;
    
    return permissions[permission] || false;
  },

  isAdmin(user: User | null): boolean {
    return this.hasRole(user, ROLES.ADMIN);
  },

  isUser(user: User | null): boolean {
    return this.hasRole(user, ROLES.USER);
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const currentUser = this.getCurrentUser();
      if (!this.isAdmin(currentUser)) {
        safeLog.error('Unauthorized role update attempt');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        safeLog.error('Error updating user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      safeLog.error('Unexpected error updating user role:', error);
      return false;
    }
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const currentUser = this.getCurrentUser();
      if (!this.isAdmin(currentUser)) {
        safeLog.error('Unauthorized access to all users');
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        safeLog.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      safeLog.error('Unexpected error fetching users:', error);
      return [];
    }
  }
};