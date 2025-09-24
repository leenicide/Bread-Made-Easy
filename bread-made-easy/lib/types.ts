// Database schema types based on the provided schema
export type AuctionStatus = 'draft' | 'upcoming' | 'active' | 'ended' | 'sold'
export type UserRole = 'user' | 'admin'
export type LeaseStatus = 'pending' | 'active' | 'expired' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PurchaseType = 'stripe' | 'paypal'
export type BidStatus = 'pending' | 'confirmed' | 'rejected' | 'pending_offer' | 'expired';

export interface User {
  id: string
  email: string
  display_name?: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

export interface Profile {
  id: string
  display_name?: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

export interface Funnel {
  id: string
  funnel_id: string
  title: string
  category_id?: string
  description?: string
  category?: Category | null

  image_url: string | null
  active: boolean
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface Tag {
  id: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface Auction {
  id: string
  funnel_id?: string
  title?: string
  description?: string
  category_id?: string
  status: AuctionStatus
  starting_price: number
  reserve_price?: number
  current_price?: number
  buy_now?: number
  winning_bid_id?: string
  starts_at: Date
  ends_at: Date
  created_at: Date
  updated_at: Date
  // Relations
  funnel?: Funnel
  category?: Category
  winning_bid?: Bid
  tags?: Tag[]
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  offer_amount?: number // Add this field
  status: BidStatus // Update the status type
  created_at: Date
  setup_intent_id?: string; // Add this field
  payment_method_id?: string; // Add this field
  // Relations
  auction?: Auction
  bidder?: User
}

export interface BuyNow {
  id: string
  funnel_id: string
  price: number
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  funnel?: Funnel
}

export interface CustomRequest {
  description: ReactNode
  title: ReactNode
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  projecttype: string
  industry: string
  targetaudience?: string
  primarygoal: string
  pages: string[]
  features: string[]
  timeline?: string
  budget?: string
  inspiration?: string
  additionalnotes?: string
  preferredcontact?: string
  submitted_at: Date
  status: string
  assigned_team_member?: string
  quarter?: string
  created_at: Date
  updated_at: Date
}

export interface LeaseRequest {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  project_type: string
  industry: string
  target_audience?: string
  primary_goal: string
  pages: string[]
  features: string[]
  integrations: string[]
  inspiration?: string
  additional_notes?: string
  preferred_contact: string
  lease_type: "performance_based" | "fixed_rate" | "revenue_share"
  estimated_revenue?: number
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "active"
    | "completed"
    | "rejected"
    | "cancelled"
  assigned_team_member?: string
  quarter: string
  submitted_at: Date
  created_at: Date
  updated_at: Date
}

export interface Lead {
  id: string
  email: string
  phone_number?: string
  username: string | null; // make sure it's `null` instead of `undefined`
  created_at: Date
  updated_at: Date
}

export interface Lease {
  id: string
  auction_id?: string
  funnel_id?: string
  renter_id: string
  status: LeaseStatus
  start_at: Date
  end_at: Date
  price: number
  notes?: string
  created_at: Date
  updated_at: Date
  // Relations
  auction?: Auction
  funnel?: Funnel
  renter?: User
}

// lib/types.ts

export interface Purchase {
  id: string
  note: 'auction' | 'buy_now'
  funnel_id: string
  buyer_id: string
  amount: number
  payment_status: string // Should match your payment_status enum
  type: string // Should match your purchase_type enum
  stripe_payment_intent_id?: string
  paypal_order_id?: string
  paypal_transaction_id?: string
  provider_fee: number
  created_at: string
  updated_at: string
}

export interface PurchaseWithDetails extends Purchase {
  funnel_title?: string
  buyer_name?: string
  buyer_email?: string
}

export interface PurchaseFilters {
  status?: string
  type?: string
  note?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface AuctionTag {
  auction_id: string
  tag_id: string
  // Relations
  auction?: Auction
  tag?: Tag
}

// Legacy interfaces for backward compatibility
export interface LegacyAuction {
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

export interface LegacyBid {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  timestamp: Date
  isWinning: boolean
}

export interface LegacyPurchase {
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
  name: string
  email: string
  company?: string | undefined
  phone?: string | undefined
  projecttype: string
  industry: string
  targetaudience?: string | undefined
  primarygoal: string
  pages: string[]
  features: string[]
  timeline?: string | undefined
  budget?: string | undefined

  inspiration?: string | undefined
  additionalnotes?: string | undefined
  preferredcontact?: string | undefined
  submitted_at: Date
  status: string
  assigned_team_member?: string | undefined
  quarter?: string | undefined
  created_at: Date
  updated_at: Date
}
// In your types file (lib/types.ts)
export interface LeadSource {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  source: 'custom_request' | 'bid_offer';
  project_type?: string;
  budget?: string;
  offer_amount?: number;
  status?: string;
  created_at: Date;
  // Additional fields from custom_requests
  industry?: string;
  targetaudience?: string;
  primarygoal?: string;
  pages?: string[];
  features?: string[];
  timeline?: string;
  inspiration?: string;
  additionalnotes?: string;
  preferredcontact?: string;
  // Additional fields from bids
  auction_id?: string;
  bidder_id?: string;
}

export interface LegacyCustomRequest {
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

export interface LegacyLead {
  id: string
  email: string
  name?: string
  source: "auction" | "direct_sale" | "custom_request" | "newsletter"
  status: "new" | "contacted" | "qualified" | "converted"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
