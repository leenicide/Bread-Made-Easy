import type { Purchase } from "./types"
import { databaseService } from "./database-service"

// Mock Stripe integration for development
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
}

// Mock payment intents storage - kept for fallback
const mockPaymentIntents: PaymentIntent[] = []

export const paymentService = {
  async createPaymentIntent(
    amount: number,
    currency = "usd",
    metadata: Record<string, string> = {},
  ): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to cents
      currency,
      status: "requires_payment_method",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata,
    }

    mockPaymentIntents.push(paymentIntent)

    return { success: true, paymentIntent }
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId = "pm_card_visa"): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const paymentIntent = mockPaymentIntents.find((pi) => pi.id === paymentIntentId)
    if (!paymentIntent) {
      return { success: false, error: "Payment intent not found" }
    }

    // Simulate successful payment
    paymentIntent.status = "succeeded"

    return { success: true, paymentIntent }
  },

  async createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase | null> {
    try {
      // Try to create purchase in database first
      const dbPurchase = await databaseService.createPurchase(purchase)
      if (dbPurchase) {
        return dbPurchase
      }
      
      // Fallback to mock creation (this shouldn't happen in production)
      console.warn('Failed to create purchase in database, using mock creation')
      return null
    } catch (error) {
      console.error('Error creating purchase in database:', error)
      return null
    }
  },

  async updatePurchaseStatus(id: string, paymentStatus: string): Promise<Purchase | null> {
    try {
      // Try to update purchase in database first
      const dbPurchase = await databaseService.updatePurchaseStatus(id, paymentStatus)
      if (dbPurchase) {
        return dbPurchase
      }
      
      // Fallback to mock update (this shouldn't happen in production)
      console.warn('Failed to update purchase in database')
      return null
    } catch (error) {
      console.error('Error updating purchase in database:', error)
      return null
    }
  },

  async getPurchases(): Promise<Purchase[]> {
    try {
      // Try to get purchases from database first
      const dbPurchases = await databaseService.getPurchases()
      if (dbPurchases.length > 0) {
        return dbPurchases
      }
      
      // Return empty array if no purchases found
      return []
    } catch (error) {
      console.error('Error fetching purchases from database:', error)
      return []
    }
  },

  // Legacy method for backward compatibility
  async processPayment(
    amount: number,
    buyerId: string,
    funnelId: string,
    type: 'auction' | 'buy_now' = 'buy_now',
    paymentMethod = 'stripe'
  ): Promise<PaymentResponse> {
    try {
      // Create payment intent
      const paymentResponse = await this.createPaymentIntent(amount)
      if (!paymentResponse.success || !paymentResponse.paymentIntent) {
        return paymentResponse
      }

      // Create purchase record
      const purchase = await this.createPurchase({
        note: type,
        funnel_id: funnelId,
        buyer_id: buyerId,
        amount,
        payment_status: 'pending',
        type: paymentMethod as any,
        stripe_payment_intent_id: paymentResponse.paymentIntent.id,
        provider_fee: 0,
      })

      if (!purchase) {
        return { success: false, error: "Failed to create purchase record" }
      }

      return paymentResponse
    } catch (error) {
      console.error('Error processing payment:', error)
      return { success: false, error: "Payment processing failed" }
    }
  }
}
