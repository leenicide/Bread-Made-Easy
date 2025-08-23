import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, DollarSign } from "lucide-react"
import Link from "next/link"

// Mock auction data
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
  const diff = endTime.getTime() - now.getTime()

  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default function AuctionsPage() {
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
            <Link href={`/auctions/${auction.id}`}>
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
