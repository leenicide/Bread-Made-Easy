// lib/strategy-call-service.ts
import { supabase } from "@/lib/supabase-client"

export interface StrategyCallBooking {
  id: string
  user_id: string | null
  email: string
  phone_number: string | null
  name: string
  company: string | null
  preferred_date: string
  preferred_time_slot: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface CreateStrategyCallBooking {
  user_id?: string | null
  email: string
  phone_number?: string | null
  name: string
  company?: string | null
  preferred_date: string
  preferred_time_slot: string
  timezone?: string
}

export class StrategyCallService {
  // Create a new strategy call booking
  async createBooking(bookingData: CreateStrategyCallBooking): Promise<StrategyCallBooking | null> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .insert([{
        user_id: bookingData.user_id || null,
        email: bookingData.email,
        phone_number: bookingData.phone_number || null,
        name: bookingData.name,
        company: bookingData.company || null,
        preferred_date: bookingData.preferred_date,
        preferred_time_slot: bookingData.preferred_time_slot,
        timezone: bookingData.timezone || 'UTC'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating strategy call booking:', error)
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    return data
  }

  // Get bookings for a specific user
  async getUserBookings(userId: string): Promise<StrategyCallBooking[]> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }

    return data || []
  }

  // Get all bookings (admin only)
  async getAllBookings(): Promise<StrategyCallBooking[]> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all bookings:', error)
      return []
    }

    return data || []
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<StrategyCallBooking | null> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return null
    }

    return data
  }

  // Update booking (admin only)
  async updateBooking(id: string, updates: Partial<StrategyCallBooking>): Promise<StrategyCallBooking | null> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      throw new Error(`Failed to update booking: ${error.message}`)
    }

    return data
  }

  // Delete booking (admin only)
  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('strategy_call_bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      throw new Error(`Failed to delete booking: ${error.message}`)
    }

    return true
  }

  // Check if user has existing bookings
  async hasExistingBookings(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('strategy_call_bookings')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (error) {
      console.error('Error checking existing bookings:', error)
      return false
    }

    return (data?.length || 0) > 0
  }
}

export const strategyCallService = new StrategyCallService()