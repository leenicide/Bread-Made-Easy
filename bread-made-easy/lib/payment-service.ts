// lib/purchase-service.ts

import { supabase } from "./supabase-client"
import { Purchase } from './types'

export interface PurchaseWithDetails extends Purchase {
  funnel_title?: string
  buyer_name?: string
  buyer_email?: string
}

export interface PurchaseFilters {
  status?: string
  type?: string
  note?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export const purchaseService = {
  /**
   * Get all purchases with optional filters
   */
  async getPurchases(filters?: PurchaseFilters): Promise<PurchaseWithDetails[]> {
    try {
      let query = supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('payment_status', filters.status)
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters?.note) {
        query = query.eq('note', filters.note)
      }
      
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }
      
      if (filters?.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount)
      }
      
      if (filters?.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount)
      }

      const { data: purchases, error } = await query

      if (error) {
        console.error('Error fetching purchases:', error)
        throw error
      }

      // Get additional details for each purchase
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          let funnel_title = '';
          let buyer_name = '';
          let buyer_email = '';

          try {
            // Get funnel title
            const { data: funnelData } = await supabase
              .from('funnels')
              .select('title')
              .eq('id', purchase.funnel_id)
              .single();
            
            funnel_title = funnelData?.title || '';

            // Get buyer info from auth.users (requires RLS to be configured properly)
            // Since we can't directly join with auth.users, we'll use a different approach
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', purchase.buyer_id)
              .single();
            
            buyer_name = profileData?.display_name || '';

            // For email, we might need to use the admin API or ensure proper RLS policies
            // For now, we'll just get the ID
          } catch (err) {
            console.error('Error fetching purchase details:', err);
          }

          return {
            ...purchase,
            funnel_title,
            buyer_name: buyer_name || purchase.buyer_id, // Fallback to ID if no name
          };
        })
      );

      return purchasesWithDetails;
    } catch (error) {
      console.error('Error in getPurchases:', error)
      throw error
    }
  },

  /**
   * Get a single purchase by ID
   */
  async getPurchaseById(id: string): Promise<PurchaseWithDetails | null> {
    try {
      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching purchase:', error)
        return null
      }

      // Get additional details
      let funnel_title = '';
      let buyer_name = '';

      try {
        // Get funnel title
        const { data: funnelData } = await supabase
          .from('funnels')
          .select('title')
          .eq('id', purchase.funnel_id)
          .single();
        
        funnel_title = funnelData?.title || '';

        // Get buyer name from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', purchase.buyer_id)
          .single();
        
        buyer_name = profileData?.display_name || '';
      } catch (err) {
        console.error('Error fetching purchase details:', err);
      }

      return {
        ...purchase,
        funnel_title,
        buyer_name: buyer_name || purchase.buyer_id,
      }
    } catch (error) {
      console.error('Error in getPurchaseById:', error)
      return null
    }
  },

  /**
   * Get purchases by user ID
   */
  async getPurchasesByUserId(userId: string): Promise<PurchaseWithDetails[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user purchases:', error)
        throw error
      }

      // Get funnel titles
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          let funnel_title = '';

          try {
            const { data: funnelData } = await supabase
              .from('funnels')
              .select('title')
              .eq('id', purchase.funnel_id)
              .single();
            
            funnel_title = funnelData?.title || '';
          } catch (err) {
            console.error('Error fetching funnel details:', err);
          }

          return {
            ...purchase,
            funnel_title,
          }
        })
      );

      return purchasesWithDetails
    } catch (error) {
      console.error('Error in getPurchasesByUserId:', error)
      throw error
    }
  },

  /**
   * Get purchases by funnel ID
   */
  async getPurchasesByFunnelId(funnelId: string): Promise<Purchase[]> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching funnel purchases:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getPurchasesByFunnelId:', error)
      throw error
    }
  },

  /**
   * Create a new purchase record
   */
  async createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase | null> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([purchase])
        .select()
        .single()

      if (error) {
        console.error('Error creating purchase:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createPurchase:', error)
      return null
    }
  },

  /**
   * Update purchase status
   */
  async updatePurchaseStatus(id: string, paymentStatus: string): Promise<Purchase | null> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating purchase status:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updatePurchaseStatus:', error)
      return null
    }
  },

  /**
   * Update purchase details
   */
  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase | null> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating purchase:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updatePurchase:', error)
      return null
    }
  },

  /**
   * Get purchase statistics
   */
  async getPurchaseStats(timeframe: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount, created_at, payment_status')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching purchase stats:', error)
        throw error
      }

      // Calculate total revenue
      const totalRevenue = data.reduce((sum, purchase) => sum + purchase.amount, 0)

      // Calculate successful purchases count
      const successfulPurchases = data.filter(p => p.payment_status === 'completed').length

      // Calculate average order value
      const averageOrderValue = successfulPurchases > 0 ? totalRevenue / successfulPurchases : 0

      return {
        totalRevenue,
        successfulPurchases,
        averageOrderValue,
        totalPurchases: data.length
      }
    } catch (error) {
      console.error('Error in getPurchaseStats:', error)
      throw error
    }
  },

  /**
   * Get recent purchases
   */
  async getRecentPurchases(limit: number = 10): Promise<PurchaseWithDetails[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent purchases:', error)
        throw error
      }

      // Get additional details
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          let funnel_title = '';
          let buyer_name = '';

          try {
            // Get funnel title
            const { data: funnelData } = await supabase
              .from('funnels')
              .select('title')
              .eq('id', purchase.funnel_id)
              .single();
            
            funnel_title = funnelData?.title || '';

            // Get buyer name from profiles
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', purchase.buyer_id)
              .single();
            
            buyer_name = profileData?.display_name || '';
          } catch (err) {
            console.error('Error fetching purchase details:', err);
          }

          return {
            ...purchase,
            funnel_title,
            buyer_name: buyer_name || purchase.buyer_id,
          };
        })
      );

      return purchasesWithDetails;
    } catch (error) {
      console.error('Error in getRecentPurchases:', error)
      throw error
    }
  },

  /**
   * Search purchases
   */
  async searchPurchases(query: string): Promise<PurchaseWithDetails[]> {
    try {
      // Search across multiple fields using OR
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .or(`stripe_payment_intent_id.ilike.%${query}%,paypal_order_id.ilike.%${query}%,paypal_transaction_id.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching purchases:', error)
        throw error
      }

      // Get additional details
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          let funnel_title = '';
          let buyer_name = '';

          try {
            // Get funnel title
            const { data: funnelData } = await supabase
              .from('funnels')
              .select('title')
              .eq('id', purchase.funnel_id)
              .single();
            
            funnel_title = funnelData?.title || '';

            // Get buyer name from profiles
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', purchase.buyer_id)
              .single();
            
            buyer_name = profileData?.display_name || '';
          } catch (err) {
            console.error('Error fetching purchase details:', err);
          }

          return {
            ...purchase,
            funnel_title,
            buyer_name: buyer_name || purchase.buyer_id,
          };
        })
      );

      return purchasesWithDetails;
    } catch (error) {
      console.error('Error in searchPurchases:', error)
      throw error
    }
  },

  /**
   * Delete a purchase (admin only)
   */
  async deletePurchase(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting purchase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deletePurchase:', error)
      return false
    }
  }
}