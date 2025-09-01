"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const [purchaseId, setPurchaseId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent")
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")
    
    if (paymentIntentId) {
      // You might want to verify the payment status with your backend
      setPurchaseId(paymentIntentId)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Processing your purchase...</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Purchase Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {purchaseId && (
            <p className="text-sm text-muted-foreground mb-6">
              Order ID: {purchaseId}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/account/purchases">View My Purchases</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}