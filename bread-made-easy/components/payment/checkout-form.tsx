"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { paymentService } from "@/lib/payment-service"
import { useAuth } from "@/contexts/auth-context"
import { CreditCard, Lock, Shield } from "lucide-react"

interface CheckoutFormProps {
  amount: number
  title: string
  description?: string
  metadata?: Record<string, string>
  onSuccess?: (purchaseId: string) => void
  onError?: (error: string) => void
}

export function CheckoutForm({ amount, title, description, metadata = {}, onSuccess, onError }: CheckoutFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123",
    name: user?.name || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setLoading(true)

    try {
      // Create payment intent
      const createResponse = await paymentService.createPaymentIntent(amount, "usd", { ...metadata, buyerId: user.id })

      if (!createResponse.success || !createResponse.paymentIntent) {
        throw new Error(createResponse.error || "Failed to create payment intent")
      }

      // Confirm payment
      const confirmResponse = await paymentService.confirmPayment(
        createResponse.paymentIntent.id,
        "pm_card_visa", // Mock payment method
      )

      if (confirmResponse.success && confirmResponse.purchase) {
        onSuccess?.(confirmResponse.purchase.id)
      } else {
        throw new Error(confirmResponse.error || "Payment failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please log in to complete your purchase</p>
            <Button asChild>
              <a href="/login">Login to Continue</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>Complete your purchase securely with Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{title}</span>
                <span className="text-sm font-medium">${amount}</span>
              </div>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardDetails.name}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardDetails.number}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="4242 4242 4242 4242"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails((prev) => ({ ...prev, cvc: e.target.value }))}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <Lock className="h-4 w-4 mr-2" />
            {loading ? "Processing Payment..." : `Pay $${amount}`}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Demo Mode: Use card 4242 4242 4242 4242 for testing</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
