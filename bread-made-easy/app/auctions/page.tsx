'use client'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, DollarSign, Eye } from "lucide-react"
import Link from "next/link"
import { auctionService } from "@/lib/auction-service"
import { useEffect, useState } from "react"
import type { Auction } from "@/lib/types"

function formatTimeRemaining(endTime: Date | string) {
  const now = new Date()
  const endDate = new Date(endTime)
  const timeLeft = endDate.getTime() - now.getTime()

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
        // Filter to only show active auctions
        const activeAuctions = dbAuctions.filter(auction => auction.status === 'active')
        setAuctions(activeAuctions)
      } catch (error) {
        console.error('Error loading auctions:', error)
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

        {auctions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Active Auctions</h2>
            <p className="text-muted-foreground mb-6">
              There are no active auctions at the moment. Check back soon for new opportunities!
            </p>
            <Button asChild>
              <Link href="/custom-request">
                Request a Custom Build
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted">
                <img
                  src={auction.funnel?.image_url || "/placeholder.svg"}
                  alt={auction.title || "Auction image"}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">
                    {auction.funnel?.category?.name || auction.category?.name || "Uncategorized"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {auction.ends_at ? formatTimeRemaining(auction.ends_at) : "No end time"}
                  </div>
                </div>
                <CardTitle className="text-lg">{auction.title || "Untitled Auction"}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {auction.description || "No description available"}
                </CardDescription>

                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Bid</p>
                        <p className="text-2xl font-bold">${auction.current_price || auction.starting_price}</p>
                      </div>
                      {auction.buy_now && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Buy Now</p>
                          <p className="text-lg font-semibold">${auction.buy_now}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {/* This would need to be fetched separately */}
                        {0} bids
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Starting: ${auction.starting_price}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/auctions/${auction.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}