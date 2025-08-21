import type { User } from "./types"

// Mock user data for development
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@breadmadeeasy.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "buyer@example.com",
    name: "John Buyer",
    role: "buyer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Mock authentication functions
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Mock password validation (in real app, this would be hashed)
    if (password !== "password123") {
      return { success: false, error: "Invalid password" }
    }

    // Store user in localStorage for persistence
    localStorage.setItem("auth_user", JSON.stringify(user))

    return { success: true, user }
  },

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: "buyer",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUsers.push(newUser)
    localStorage.setItem("auth_user", JSON.stringify(newUser))

    return { success: true, user: newUser }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_user")
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem("auth_user")
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  },
}
