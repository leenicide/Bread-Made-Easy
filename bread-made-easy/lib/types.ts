export interface User {
  id: string
  email: string
  name: string
  role: "buyer" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Auction {
  id: string
  title: string
  description: string
  startingPrice: number
  currentPrice: number
  buyNowPrice?: number
  startTime: Date
  endTime: Date
  status: "upcoming" | "active" | "ended" | "sold"
  sellerId: string
  winnerId?: string
  imageUrl?: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  timestamp: Date
  isWinning: boolean
}

export interface Purchase {
  id: string
  buyerId: string
  auctionId?: string
  type: "auction_win" | "buy_now" | "direct_sale"
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentIntentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomRequest {
  id: string
  buyerId: string
  title: string
  description: string
  budget: number
  deadline?: Date
  status: "open" | "in_progress" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  email: string
  name?: string
  source: "auction" | "direct_sale" | "custom_request" | "newsletter"
  status: "new" | "contacted" | "qualified" | "converted"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
