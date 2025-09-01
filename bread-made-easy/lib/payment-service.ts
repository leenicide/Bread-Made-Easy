import type { Purchase } from "./types"
import { databaseService } from "./database-service"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "canceled"
  clientSecret: string
  metadata: Record<string, string>
}

export interface PaymentResponse {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
  purchase?: Purchase
}

export const paymentService = {
  async createPaymentIntent(
    amount: number,
    currency = "usd",
    metadata: Record<string, string> = {},
  ): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-payment-intent', {
        body: { 
          amount, 
          currency, 
          metadata 
        }
      })
      
      if (error) throw error
      
      return {
        success: true,
        paymentIntent: {
          id: data.paymentIntentId,
          amount: data.amount || amount * 100,
          currency: data.currency || currency,
          status: "requires_payment_method",
          clientSecret: data.clientSecret,
          metadata: data.metadata || metadata
        }
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      }
    }
  },

  async confirmPayment(
    paymentIntentId: string, 
    paymentMethodId: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { 
          paymentIntentId, 
          auctionId: metadata.auctionId,
          type: metadata.type,
          buyerId: metadata.buyerId
        }
      })
      
      if (error) throw error
      
      return {
        success: true,
        paymentIntent: {
          id: paymentIntentId,
          amount: data.amount || 0,
          currency: 'usd',
          status: "succeeded",
          clientSecret: '',
          metadata
        },
        purchase: data.purchase
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      }
    }
  },

  async createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase | null> {
    try {
      const dbPurchase = await databaseService.createPurchase(purchase)
      if (dbPurchase) {
        return dbPurchase
      }
      
      console.error('Failed to create purchase in database')
      return null
    } catch (error) {
      console.error('Error creating purchase in database:', error)
      return null
    }
  },

  async updatePurchaseStatus(id: string, paymentStatus: string): Promise<Purchase | null> {
    try {
      const dbPurchase = await databaseService.updatePurchaseStatus(id, paymentStatus)
      if (dbPurchase) {
        return dbPurchase
      }
      
      console.error('Failed to update purchase in database')
      return null
    } catch (error) {
      console.error('Error updating purchase in database:', error)
      return null
    }
  },

  async getPurchases(): Promise<Purchase[]> {
    try {
      const dbPurchases = await databaseService.getPurchases()
      return dbPurchases
    } catch (error) {
      console.error('Error fetching purchases from database:', error)
      return []
    }
  },

  async getPurchaseById(id: string): Promise<Purchase | null> {
    try {
      const purchase = await databaseService.getPurchaseById(id)
      return purchase
    } catch (error) {
      console.error('Error fetching purchase:', error)
      return null
    }
  },

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    try {
      const purchases = await databaseService.getPurchasesByUserId(userId)
      return purchases
    } catch (error) {
      console.error('Error fetching user purchases:', error)
      return []
    }
  },

  // Legacy method for backward compatibility
  async processPayment(
    amount: number,
    buyerId: string,
    funnelId: string,
    type: 'auction' | 'buy_now' = 'buy_now',
    paymentMethod = 'stripe',
    metadata: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    try {
      // Create payment intent
      const paymentResponse = await this.createPaymentIntent(amount, 'usd', {
        ...metadata,
        buyerId,
        funnelId,
        type
      })
      
      if (!paymentResponse.success || !paymentResponse.paymentIntent) {
        return paymentResponse
      }

      return paymentResponse
    } catch (error) {
      console.error('Error processing payment:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Payment processing failed" 
      }
    }
  },

  // Method to verify payment status with Stripe
  async verifyPaymentStatus(paymentIntentId: string): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentIntentId }
      })
      
      if (error) throw error
      
      return {
        success: data.status === 'succeeded',
        paymentIntent: {
          id: paymentIntentId,
          amount: data.amount || 0,
          currency: data.currency || 'usd',
          status: data.status,
          clientSecret: '',
          metadata: data.metadata || {}
        }
      }
    } catch (error) {
      console.error('Error verifying payment status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment status'
      }
    }
  },

  // Method to handle payment failures and refunds if needed
  async handlePaymentFailure(paymentIntentId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('handle-payment-failure', {
        body: { paymentIntentId, reason }
      })
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Error handling payment failure:', error)
      return false
    }
  }
}