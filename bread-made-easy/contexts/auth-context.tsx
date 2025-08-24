"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { authService, type AuthResponse } from "@/lib/auth" 
import {supabase} from "@/lib/supabase-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  signup: (email: string, password: string, name: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  getRedirectPath: (userRole: string) => string // Add this function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to determine redirect path based on user role
  const getRedirectPath = (userRole: string): string => {
    switch(userRole) {
      case 'admin':
        return '/admin'
      case 'buyer':
      default:
        return '/dashboard'
    }
  }

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (profile && !error) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            display_name: profile.display_name,
            role: profile.role,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
          setUser(userData)
          localStorage.setItem("auth_user", JSON.stringify(userData))
        }
      } else {
        setUser(null)
        localStorage.removeItem("auth_user")
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password)
    if (response.success && response.user) {
      setUser(response.user)
    }
    return response
  }

  const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await authService.signup(email, password, name)
    if (response.success && response.user) {
      setUser(response.user)
    }
    return response
  }

  const logout = async (): Promise<void> => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      getRedirectPath // Add this to the context
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}