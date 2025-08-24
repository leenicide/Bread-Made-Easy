"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { auctionService } from "@/lib/auction-service"
import { funnelService } from "@/lib/funnel-service"
import type { Auction, Funnel } from "@/lib/types"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_price: 0,
    buy_now: 0,
    ends_at: "",
    funnel_id: "",
  })
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    starting_price: 0,
    current_price: 0,
    buy_now: 0,
    ends_at: "",
    status: "active" as "active" | "draft" | "ended",
    funnel_id: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionsData, funnelsData] = await Promise.all([
          auctionService.getAuctions(),
          funnelService.getFunnels(),
        ])
        setAuctions(auctionsData)
        setFunnels(funnelsData)
      } catch (error) {
        console.error("Failed to fetch auctions or funnels:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEditClick = (auction: Auction) => {
    setEditingAuction(auction)
    setFormData({
      title: auction.title || "",
      description: auction.description || "",
      starting_price: auction.starting_price || 0,
      buy_now: auction.buy_now || 0,
      ends_at: auction.ends_at ? new Date(auction.ends_at).toISOString().slice(0, 16) : "",
      funnel_id: auction.funnel_id || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveClick = async () => {
    if (!editingAuction) return

    try {
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

  const handleCreateClick = async () => {
    try {
      const createData = {
        ...createFormData,
        ends_at: createFormData.ends_at
          ? new Date(createFormData.ends_at)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        starts_at: new Date(),
      }
      const newAuction = await auctionService.createAuction(createData)
      if (newAuction) {
        setAuctions([...auctions, newAuction])
        setIsCreateDialogOpen(false)
        setCreateFormData({
          title: "",
          description: "",
          starting_price: 0,
          current_price: 0,
          buy_now: 0,
          ends_at: "",
          status: "active",
          funnel_id: "",
        })
      }
    } catch (error) {
      console.error("Failed to create auction:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('buy_now') ? Number(value) : value
    }))
  }

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCreateFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('buy_now') ? Number(value) : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Auctions</h1>
            <p className="text-muted-foreground">Manage your marketplace auctions</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Auction
          </Button>
        </div>

        {/* Search */}
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

        {/* Auction Cards */}
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
              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
              </div>
              {/* Prices */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="starting_price" className="text-right">Starting Price</Label>
                <Input id="starting_price" name="starting_price" type="number" value={formData.starting_price} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-current_price" className="text-right">Current Price</Label>
                <Input id="create-current_price" name="current_price" type="number"value={createFormData.current_price} onChange={handleCreateInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buy_now" className="text-right">Buy Now Price</Label>
                <Input id="buy_now" name="buy_now" type="number" value={formData.buy_now} onChange={handleInputChange} className="col-span-3" />
              </div>
              {/* End Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ends_at" className="text-right">End Date & Time</Label>
                <Input id="ends_at" name="ends_at" type="datetime-local" value={formData.ends_at} onChange={handleInputChange} className="col-span-3" />
              </div>
              {/* Funnel Select */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-funnel_id" className="text-right">Funnel</Label>
                <Select value={formData.funnel_id} onValueChange={(value) => handleEditSelectChange("funnel_id", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select funnel" />
                  </SelectTrigger>
                  <SelectContent>
                    {funnels.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>{funnel.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
              <Button onClick={handleSaveClick}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Auction</DialogTitle>
              <DialogDescription>Fill in the details for your new auction. Click create when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-title" className="text-right">Title</Label>
                <Input id="create-title" name="title" value={createFormData.title} onChange={handleCreateInputChange} className="col-span-3" />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-description" className="text-right">Description</Label>
                <Textarea id="create-description" name="description" value={createFormData.description} onChange={handleCreateInputChange} className="col-span-3" />
              </div>
              {/* Prices */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-starting_price" className="text-right">Starting Price</Label>
                <Input id="create-starting_price" name="starting_price" type="number" value={createFormData.starting_price} onChange={handleCreateInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-buy_now" className="text-right">Buy Now Price</Label>
                <Input id="create-buy_now" name="buy_now" type="number" value={createFormData.buy_now} onChange={handleCreateInputChange} className="col-span-3" />
              </div>
              {/* End Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-ends_at" className="text-right">End Date & Time</Label>
                <Input id="create-ends_at" name="ends_at" type="datetime-local" value={createFormData.ends_at} onChange={handleCreateInputChange} className="col-span-3" />
              </div>
              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-status" className="text-right">Status</Label>
                <Select value={createFormData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Funnel Select */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-funnel_id" className="text-right">Funnel</Label>
                <Select value={createFormData.funnel_id} onValueChange={(value) => handleSelectChange("funnel_id", value)}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select funnel" /></SelectTrigger>
                  <SelectContent>
                    {funnels.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>{funnel.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
              <Button onClick={handleCreateClick}><Plus className="h-4 w-4 mr-2" />Create Auction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
