"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { CheckoutForm } from "@/components/payment/checkout-form"
import { auctionService } from "@/lib/auction-service"
import type { Auction } from "@/lib/types"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [loading, setLoading] = useState(true)

  const auctionId = searchParams.get("auctionId")
  const type = searchParams.get("type") as "auction_win" | "buy_now" | "direct_sale"
  const amount = Number.parseFloat(searchParams.get("amount") || "0")

  useEffect(() => {
    const fetchAuction = async () => {
      if (auctionId) {
        try {
          const auctionData = await auctionService.getAuction(auctionId)
          setAuction(auctionData)
        } catch (error) {
          console.error("Failed to fetch auction:", error)
        }
      }
      setLoading(false)
    }

    fetchAuction()
  }, [auctionId])

  const handleSuccess = (purchaseId: string) => {
    router.push(`/purchase-success?purchaseId=${purchaseId}`)
  }

  const handleError = (error: string) => {
    console.error("Payment error:", error)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!auctionId || !type || !amount) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Checkout</h1>
            <p className="text-muted-foreground">Missing required checkout information.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">You're about to purchase: {auction?.title || "Sales Funnel"}</p>
          </div>

          <CheckoutForm
            amount={amount}
            title={auction?.title || "Sales Funnel"}
            description={`${type === "buy_now" ? "Buy Now" : type === "auction_win" ? "Auction Win" : "Direct Sale"} - ${auction?.category || "Digital Product"}`}
            metadata={{
              auctionId: auctionId,
              type: type,
              title: auction?.title || "Unknown",
            }}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </main>
    </div>
  )
}
