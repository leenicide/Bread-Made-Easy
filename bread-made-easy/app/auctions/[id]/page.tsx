"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CountdownTimer } from "@/components/auction/countdown-timer"
import { BidForm } from "@/components/auction/bid-form"
import { BidHistory } from "@/components/auction/bid-history"
import { auctionService } from "@/lib/auction-service"
import type { Auction, Bid } from "@/lib/types"
import { ArrowLeft, Eye, Heart, Share2, Tag, Users, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AuctionDetailPage() {
  const params = useParams()
  const auctionId = params.id as string
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const [auctionData, bidsData] = await Promise.all([
          auctionService.getAuctionById(auctionId),
          auctionService.getBidsByAuction(auctionId)
        ])
        
        if (auctionData) {
          setAuction(auctionData)
          setBids(bidsData)
        } else {
          setError("Auction not found")
        }
      } catch (err) {
        setError("Failed to load auction")
      } finally {
        setLoading(false)
      }
    }

    if (auctionId) {
      fetchAuctionData()
    }
  }, [auctionId])

  const handleBidPlaced = async (updatedAuction: Auction) => {
    setAuction(updatedAuction)
    // Refresh bids after a new bid is placed
    const bidsData = await auctionService.getBidsByAuction(auctionId)
    setBids(bidsData)
  }

  const handleBuyNow = (updatedAuction: Auction) => {
    setAuction(updatedAuction)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-video bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Auction Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The auction you're looking for doesn't exist."}</p>
            <Button asChild>
              <Link href="/auctions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Auctions
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Format dates and handle database vs mock data structure
  const startTime = 'startTime' in auction ? auction.startTime : new Date(auction.starts_at)
  const endTime = 'endTime' in auction ? auction.endTime : new Date(auction.ends_at)
  const currentPrice = 'currentPrice' in auction ? auction.currentPrice : auction.current_price
  const startingPrice = 'startingPrice' in auction ? auction.startingPrice : auction.starting_price
  const category = 'category' in auction ? auction.category : auction.category?.name || 'Uncategorized'
  const imageUrl = 'imageUrl' in auction ? auction.imageUrl : "/placeholder.svg"

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/auctions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Auctions
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Image */}
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={auction.title || 'Auction'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Auction Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category}</Badge>
                      <CountdownTimer
                        endTime={endTime}
                        onExpire={() => {
                          setAuction((prev) => (prev ? { ...prev, status: "ended" } : null))
                        }}
                      />
                    </div>
                    <CardTitle className="text-2xl">{auction.title || 'Untitled Auction'}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-base leading-relaxed">
                  {auction.description || 'No description available'}
                </CardDescription>

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Started: {startTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Starting Price: ${startingPrice}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">147 views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{bids.length} bids</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">What's Included:</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      "Complete funnel source code",
                      "Setup documentation",
                      "Design assets & graphics",
                      "Email templates",
                      "Analytics tracking setup",
                      "30-day support included",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Bidding Form */}
            <BidForm auction={auction} onBidPlaced={handleBidPlaced} onBuyNow={handleBuyNow} />

            {/* Bid History */}
            <BidHistory bids={bids} />
          </div>
        </div>
      </main>
    </div>
  )
}