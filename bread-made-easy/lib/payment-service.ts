import type { Purchase } from "./types"

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
  purchase?: Purchase
  error?: string
}

// Mock payment intents storage
const mockPaymentIntents: PaymentIntent[] = []
const mockPurchases: Purchase[] = []

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
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const paymentIntent = mockPaymentIntents.find((pi) => pi.id === paymentIntentId)
    if (!paymentIntent) {
      return { success: false, error: "Payment intent not found" }
    }

    // Simulate payment success (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      paymentIntent.status = "succeeded"

      // Create purchase record
      const purchase: Purchase = {
        id: `purchase_${Date.now()}`,
        buyerId: paymentIntent.metadata.buyerId || "unknown",
        auctionId: paymentIntent.metadata.auctionId,
        type: paymentIntent.metadata.type as "auction_win" | "buy_now" | "direct_sale",
        amount: paymentIntent.amount / 100, // Convert back from cents
        status: "completed",
        stripePaymentIntentId: paymentIntent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPurchases.push(purchase)

      return { success: true, paymentIntent, purchase }
    } else {
      paymentIntent.status = "canceled"
      return { success: false, error: "Payment failed. Please try again." }
    }
  },

  async getPurchase(purchaseId: string): Promise<Purchase | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockPurchases.find((p) => p.id === purchaseId) || null
  },

  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockPurchases.filter((p) => p.buyerId === userId)
  },

  async refundPayment(paymentIntentId: string): Promise<PaymentResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const paymentIntent = mockPaymentIntents.find((pi) => pi.id === paymentIntentId)
    if (!paymentIntent) {
      return { success: false, error: "Payment intent not found" }
    }

    const purchase = mockPurchases.find((p) => p.stripePaymentIntentId === paymentIntentId)
    if (purchase) {
      purchase.status = "refunded"
      purchase.updatedAt = new Date()
    }

    return { success: true, paymentIntent, purchase }
  },
}
