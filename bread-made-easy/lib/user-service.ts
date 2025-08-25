// lib/user-service.ts
import { supabase } from "@/lib/supabase-client"
import type { User } from "./types"

export class UserService {
  // Get all users using RPC
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_users')
      
      if (error) {
        console.error('Error fetching users via RPC:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  // Update user role using RPC
  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: role
      })

      if (error) {
        console.error('Error updating user role via RPC:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  // Search users using RPC
  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_query: query
      })

      if (error) {
        console.error('Error searching users via RPC:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchUsers:', error)
      return []
    }
  }

  // Get user by ID (using regular query since it's specific)
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.rpc('get_all_users')
      
      if (error) {
        console.error('Error fetching users for getById:', error)
        return null
      }

      return data?.find((user: User) => user.id === userId) || null
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }
}

export const userService = new UserService()