"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { authService, type AuthResponse } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  signup: (email: string, password: string, name: string) => Promise<AuthResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
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

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
