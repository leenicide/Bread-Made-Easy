"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { auctionService } from "@/lib/auction-service"
import type { Auction } from "@/lib/types"
import { Plus, Search, Edit, Eye, Pause, Play } from "lucide-react"

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const auctionsData = await auctionService.getAuctions()
        console.log("First auction object:", auctionsData[0]) // Inspect the structure
        setAuctions(auctionsData)
      } catch (error) {
        console.error("Failed to fetch auctions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuctions()
  }, [])

  const filteredAuctions = auctions.filter((auction) => 
    auction.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Auctions</h1>
            <p className="text-muted-foreground">Manage your marketplace auctions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Auction
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{auction.title || "Untitled Auction"}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {auction.description || "No description available"}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      {auction.category && (
                        <Badge variant="secondary">{auction.category.toString()}</Badge>
                      )}
                      <Badge
                        variant={
                          auction.status === "active"
                            ? "default"
                            : auction.status === "ended"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {auction.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="aspect-video w-32 bg-muted rounded overflow-hidden">
                    <img
                      src="/placeholder.svg"
                      alt={auction.title || "Auction image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="font-semibold">${auction.current_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                    <p className="font-semibold">${auction.starting_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buy Now Price</p>
                    <p className="font-semibold">${auction.buy_now || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ends</p>
                    <p className="font-semibold">
                      {auction.ends_at ? new Date(auction.ends_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {auction.status === "active" ? (
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}