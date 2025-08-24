"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { auctionService } from "@/lib/auction-service"
import type { Auction } from "@/lib/types"
import { Plus, Search, Edit, Eye, Pause, Play, X, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_price: 0,
    buy_now: 0,
    ends_at: "",
  })

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const auctionsData = await auctionService.getAuctions()
        console.log("First auction object:", auctionsData[0])
        setAuctions(auctionsData)
      } catch (error) {
        console.error("Failed to fetch auctions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuctions()
  }, [])

  const handleEditClick = (auction: Auction) => {
    setEditingAuction(auction)
    setFormData({
      title: auction.title || "",
      description: auction.description || "",
      starting_price: auction.starting_price || 0,
      buy_now: auction.buy_now || 0,
      ends_at: auction.ends_at ? new Date(auction.ends_at).toISOString().slice(0, 16) : "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveClick = async () => {
    if (!editingAuction) return

    try {
      // Convert the form data to match the Auction type
      const updateData = {
        ...formData,
        ends_at: formData.ends_at ? new Date(formData.ends_at) : undefined,
      }
      
      const updatedAuction = await auctionService.updateAuction(editingAuction.id, updateData)
      if (updatedAuction) {
        setAuctions(auctions.map(a => a.id === editingAuction.id ? updatedAuction : a))
        setIsEditDialogOpen(false)
        setEditingAuction(null)
      }
    } catch (error) {
      console.error("Failed to update auction:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('buy_now') ? Number(value) : value
    }))
  }

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
                      src={auction.funnel?.image_url || "/placeholder.svg"}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent"
                    onClick={() => handleEditClick(auction)}
                  >
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Auction</DialogTitle>
              <DialogDescription>
                Make changes to the auction details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="starting_price" className="text-right">
                  Starting Price
                </Label>
                <Input
                  id="starting_price"
                  name="starting_price"
                  type="number"
                  value={formData.starting_price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buy_now" className="text-right">
                  Buy Now Price
                </Label>
                <Input
                  id="buy_now"
                  name="buy_now"
                  type="number"
                  value={formData.buy_now}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ends_at" className="text-right">
                  End Date & Time
                </Label>
                <Input
                  id="ends_at"
                  name="ends_at"
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveClick}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}