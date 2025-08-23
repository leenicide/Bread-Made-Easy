"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { auctionService } from "@/lib/auction-service"
import type { Auction } from "@/lib/types"
import { Gavel, Zap, TrendingUp, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface BidFormProps {
  auction: Auction
  onBidPlaced?: (auction: Auction) => void
  onBuyNow?: (auction: Auction) => void
}

export function BidForm({ auction, onBidPlaced, onBuyNow }: BidFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const minBid = auction.currentPrice + 25 // Minimum increment of $25

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const amount = Number.parseFloat(bidAmount)
      if (isNaN(amount) || amount <= auction.currentPrice) {
        setError(`Bid must be higher than current price of $${auction.currentPrice}`)
        return
      }

      const response = await auctionService.placeBid(auction.id, user.id, amount)

      if (response.success && response.auction) {
        setSuccess(`Bid placed successfully!`)
        setBidAmount("")
        onBidPlaced?.(response.auction)
        
        // Redirect to post-bid page after a brief delay
        setTimeout(() => {
          router.push(`/post-bid/${auction.id}`)
        }, 1500)
      } else {
        setError(response.error || "Failed to place bid")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user || !auction.buyNowPrice) return
    router.push(`/checkout?auctionId=${auction.id}&type=buy_now&amount=${auction.buyNowPrice}`)
  }

  const handleLease = async () => {
    if (!user) return
    router.push(`/lease?auctionId=${auction.id}`)
  }

  const handleMakeOffer = async () => {
    if (!user) return
    router.push(`/auctions/${auction.id}/make-offer`)
  }

  if (!user) {
    return (
      <div className="p-6 border rounded-lg bg-muted/30">
        <p className="text-center text-muted-foreground mb-4">Please log in to place bids or make purchases</p>
        <Button className="w-full" asChild>
          <a href="/login">Login to Bid</a>
        </Button>
      </div>
    )
  }

  if (auction.status !== "active") {
    return (
      <div className="p-6 border rounded-lg bg-muted/30">
        <p className="text-center text-muted-foreground">This auction has ended</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          <AlertDescription>{error || success}</AlertDescription>
        </Alert>
      )}

      <div className="p-6 border rounded-lg space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Highest Bid</p>
          <p className="text-3xl font-bold">${auction.currentPrice}</p>
        </div>

        <form onSubmit={handlePlaceBid} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid Amount</Label>
            <Input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: $${minBid}`}
              min={minBid}
              step="25"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Minimum bid: ${minBid} (current bid + $25)</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Placing Bid...
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4 mr-2" />
                Place Bid
              </>
            )}
          </Button>
        </form>

        {auction.buyNowPrice && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Skip the bidding</p>
              <p className="text-xl font-semibold">${auction.buyNowPrice}</p>
              <Button onClick={handleBuyNow} variant="outline" className="w-full" disabled={loading}>
                <Zap className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </>
        )}

        {/* Make an Offer Option */}
        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Make us an offer to end the auction early</p>
          <Button onClick={handleMakeOffer} variant="outline" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Make an Offer"}
          </Button>
        </div> */}

        {/* Lease Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Low upfront cost, recurring model</p>
          <Button onClick={handleLease} variant="outline" className="w-full" disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {loading ? "Processing..." : "Lease This Funnel"}
          </Button>
        </div>
      </div>
    </div>
  )
}