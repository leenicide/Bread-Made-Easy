import type { Auction, Bid } from "./types"

// Extended mock auction data with more details
const mockAuctions: Auction[] = [
  {
    id: "1",
    title: "High-Converting E-commerce Funnel",
    description:
      "Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate across multiple industries. Includes landing pages, checkout flow, thank you pages, and automated email sequences.",
    startingPrice: 500,
    currentPrice: 850,
    buyNowPrice: 1200,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 1 day ago
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days
    status: "active",
    sellerId: "seller1",
    winnerId: undefined,
    imageUrl: "/ecommerce-funnel-dashboard.png",
    category: "E-commerce",
    tags: ["ecommerce", "conversion", "automation", "email-marketing"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "SaaS Lead Generation System",
    description:
      "Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion rate. Perfect for B2B SaaS companies looking to scale their lead generation.",
    startingPrice: 800,
    currentPrice: 1200,
    buyNowPrice: 1800,
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // Started 12 hours ago
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // Ends in 5 hours
    status: "active",
    sellerId: "seller2",
    winnerId: undefined,
    imageUrl: "/saas-lead-generation-funnel.png",
    category: "SaaS",
    tags: ["saas", "lead-generation", "webinar", "b2b"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Course Launch Funnel Template",
    description:
      "Complete course launch sequence with early bird pricing, social proof integration, and payment plans. Used to launch 50+ successful online courses with average revenue of $100k+.",
    startingPrice: 400,
    currentPrice: 650,
    buyNowPrice: 900,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // Started 6 hours ago
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Ends in 1 day
    status: "active",
    sellerId: "seller3",
    winnerId: undefined,
    imageUrl: "/online-course-funnel.png",
    category: "Education",
    tags: ["course", "education", "launch", "social-proof"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

// Mock bid data
const mockBids: Bid[] = [
  {
    id: "bid1",
    auctionId: "1",
    bidderId: "2",
    amount: 850,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isWinning: true,
  },
  {
    id: "bid2",
    auctionId: "1",
    bidderId: "buyer2",
    amount: 800,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isWinning: false,
  },
  {
    id: "bid3",
    auctionId: "2",
    bidderId: "buyer3",
    amount: 1200,
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isWinning: true,
  },
]

export interface BidResponse {
  success: boolean
  bid?: Bid
  auction?: Auction
  error?: string
}

export const auctionService = {
  async getAuction(id: string): Promise<Auction | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockAuctions.find((auction) => auction.id === id) || null
  },

  async getAuctions(): Promise<Auction[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockAuctions
  },

  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockBids
      .filter((bid) => bid.auctionId === auctionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  async placeBid(auctionId: string, bidderId: string, amount: number): Promise<BidResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const auction = mockAuctions.find((a) => a.id === auctionId)
    if (!auction) {
      return { success: false, error: "Auction not found" }
    }

    if (auction.status !== "active") {
      return { success: false, error: "Auction is not active" }
    }

    if (new Date() > auction.endTime) {
      return { success: false, error: "Auction has ended" }
    }

    if (amount <= auction.currentPrice) {
      return { success: false, error: `Bid must be higher than current price of $${auction.currentPrice}` }
    }

    // Create new bid
    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      auctionId,
      bidderId,
      amount,
      timestamp: new Date(),
      isWinning: true,
    }

    // Mark previous bids as not winning
    mockBids.forEach((bid) => {
      if (bid.auctionId === auctionId) {
        bid.isWinning = false
      }
    })

    // Add new bid
    mockBids.push(newBid)

    // Update auction current price
    auction.currentPrice = amount
    auction.updatedAt = new Date()

    return { success: true, bid: newBid, auction }
  },

  async buyNow(auctionId: string, buyerId: string): Promise<BidResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const auction = mockAuctions.find((a) => a.id === auctionId)
    if (!auction) {
      return { success: false, error: "Auction not found" }
    }

    if (auction.status !== "active") {
      return { success: false, error: "Auction is not active" }
    }

    if (!auction.buyNowPrice) {
      return { success: false, error: "Buy now option not available" }
    }

    // End auction immediately
    auction.status = "sold"
    auction.winnerId = buyerId
    auction.currentPrice = auction.buyNowPrice
    auction.endTime = new Date()
    auction.updatedAt = new Date()

    return { success: true, auction }
  },
}
