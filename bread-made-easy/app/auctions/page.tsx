'use client'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { auctionService } from "@/lib/auction-service"
import { useEffect, useState } from "react"
import type { Auction } from "@/lib/types"

// Mock auction data for fallback
const mockAuctions = [
  {
    id: "1",
    title: "High-Converting E-commerce Funnel",
    description:
      "Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate.",
    currentPrice: 850,
    startingPrice: 500,
    buyNowPrice: 1200,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    bidCount: 12,
    category: "E-commerce",
    imageUrl: "/ecommerce-funnel-dashboard.png",
    status: "active" as const,
  },
  {
    id: "2",
    title: "SaaS Lead Generation System",
    description:
      "Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion.",
    currentPrice: 1200,
    startingPrice: 800,
    buyNowPrice: 1800,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    bidCount: 8,
    category: "SaaS",
    imageUrl: "/saas-lead-generation-funnel.png",
    status: "active" as const,
  },
  {
    id: "3",
    title: "Course Launch Funnel Template",
    description:
      "Complete course launch sequence with early bird pricing, social proof integration, and payment plans.",
    currentPrice: 650,
    startingPrice: 400,
    buyNowPrice: 900,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    bidCount: 15,
    category: "Education",
    imageUrl: "/online-course-funnel.png",
    status: "active" as const,
  },
]

function formatTimeRemaining(endTime: Date) {
  const now = new Date()
  const timeLeft = endTime.getTime() - now.getTime()

  if (timeLeft <= 0) {
    return "Ended"
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuctions() {
      try {
        const dbAuctions = await auctionService.getAuctions()
        setAuctions(dbAuctions)
      } catch (error) {
        console.error('Error loading auctions:', error)
        // Fallback to mock data
        setAuctions([])
      } finally {
        setLoading(false)
      }
    }

    loadAuctions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        </div>
      </div>
    )
  }

  // Transform database auctions to display format
  const displayAuctions = auctions.length > 0 ? auctions.map(auction => ({
    id: auction.id,
    title: auction.title || 'Untitled Auction',
    description: auction.description || 'No description available',
    currentPrice: auction.current_price || auction.starting_price,
    startingPrice: auction.starting_price,
    buyNowPrice: undefined, // Not available in new schema
    endTime: auction.ends_at,
    bidCount: 0, // Will be populated separately
    category: auction.category?.name || 'Uncategorized',
    imageUrl: auction.funnel?.description ? `/placeholder.jpg` : undefined,
    status: auction.status,
  })) : mockAuctions

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Auctions</h1>
          <p className="text-muted-foreground">
            Bid on exclusive, high-converting sales funnels. All auctions include full source code, documentation, and
            setup guides.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockAuctions.map((auction) => (
        <Link key={auction.id} href={`/auctions/${auction.id}`}>
            <Card key={auction.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src={auction.imageUrl || "/placeholder.svg"}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{auction.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTimeRemaining(auction.endTime)}
                  </div>
                </div>
                <CardTitle className="text-lg">{auction.title}</CardTitle>
                <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-2xl font-bold">${auction.currentPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Buy Now</p>
                      <p className="text-lg font-semibold">${auction.buyNowPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {auction.bidCount} bids
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Starting: ${auction.startingPrice}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
  }
