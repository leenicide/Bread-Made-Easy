import { supabase } from "@/lib/supabase-client"
import type { 
  Auction, 
  Bid, 
  BuyNow, 
  CustomRequest, 
  Funnel, 
  Lead, 
  Purchase, 
  User, 
  Tag,
  AuctionTag,
  Lease
} from './types'

export class DatabaseService {
  // Funnel operations
  async getFunnels(): Promise<Funnel[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching funnels:', error)
      return []
    }

    return data || []
  }

  async getBidById(id: string): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching bid:', error)
      return null
    }

    return data
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:profiles(*)
      `)
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user bids:', error)
      return []
    }

    return data
  }

  async getFunnelById(id: string): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching funnel:', error)
      return null
    }

    return data
  }

  async createFunnel(funnel: Omit<Funnel, 'id' | 'created_at' | 'updated_at'>): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .insert([funnel])
      .select()
      .single()

    if (error) {
      console.error('Error creating funnel:', error)
      return null
    }

    return data
  }

  // Auction operations
  async getAuctions(): Promise<Auction[]> {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        funnel:funnels(*),
        winning_bid:bids!winning_bid_id(*)  
      `)
      .order('ends_at', { ascending: true })

    console.log('Fetched auctions:', data)

    if (error) {
      console.error('Error fetching auctions:', error)
      return []
    }

    return data || []
  }

  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  
    if (error) {
      console.error('Error updating bid:', error)
      return null
    }
  
    return data
  }

  async getAuctionById(id: string): Promise<Auction | null> {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        funnel:funnels(*),
        winning_bid:bids!winning_bid_id(*)
      `)
      .eq('id', id)
      .single()
  
    if (error) {
      console.error('Error fetching auction:', error)
      return null
    }
  
    // Get bids separately to avoid the relationship conflict
    const { data: bidsData } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', id)
      .order('amount', { ascending: false })
  
    return {
      ...data,
      bids: bidsData || []
    }
  }

  async createAuction(auction: Omit<Auction, 'id' | 'created_at' | 'updated_at'>): Promise<Auction | null> {
    const { data, error } = await supabase
      .from('auctions')
      .insert([auction])
      .select()
      .single()

    if (error) {
      console.error("Error creating auction:", error.message, error.details, error.hint)
      return null
    }

    return data
  }

  async updateAuction(id: string, updates: Partial<Auction>): Promise<Auction | null> {
    const { data, error } = await supabase
      .from('auctions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating auction:', error)
      return null
    }

    return data
  }


  // In your database-service.ts file
  async getBids(): Promise<Bid[]> {
    try {
      const { data: bids, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all bids:', error)
        return []
      }

      if (bids && bids.length > 0) {
        const profileIds = bids.map(b => b.bidder_id)
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', profileIds)

        if (profileError) {
          console.error('Error fetching profiles for bids:', profileError)
          return bids
        }

        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
        bids.forEach(bid => {
          (bid as any).bidder = profileMap[bid.bidder_id] || null
        })
      }

      return bids || []
    } catch (error) {
      console.error('Error in getBids:', error)
      return []
    }
  }

  // Bid operations
  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })

    if (error) {
      console.error('Error fetching bids:', error)
      return []
    }

    if (bids && bids.length > 0) {
      const profileIds = bids.map(b => b.bidder_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', profileIds)

      if (profileError) {
        console.error('Error fetching profiles for bids:', profileError)
        return bids
      }

      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
      bids.forEach(bid => {
        (bid as any).bidder = profileMap[bid.bidder_id] || null
      })
    }

    return bids || []
  }

  async createBid(bid: Omit<Bid, 'id' | 'created_at'>): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .insert([{
        ...bid,
        payment_intent_id: bid.payment_intent_id || null // Add payment intent ID
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating bid:', error)
      return null
    }

    return data
}

  // Buy Now operations
  async getBuyNowOffers(): Promise<BuyNow[]> {
    const { data, error } = await supabase
      .from('by_now')
      .select(`
        *,
        funnel:funnels(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching buy now offers:', error)
      return []
    }

    return data || []
  }

  async getBuyNowByFunnel(funnelId: string): Promise<BuyNow | null> {
    const { data, error } = await supabase
      .from('by_now')
      .select(`
        *,
        funnel:funnels(*)
      `)
      .eq('funnel_id', funnelId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching buy now offer:', error)
      return null
    }

    return data
  }

  // Custom Request operations
  async createCustomRequest(request: Omit<CustomRequest, 'id' | 'created_at' | 'updated_at'>): Promise<CustomRequest | null> {
    const { data, error } = await supabase
      .from('custom_requests')
      .insert([request])
      .select()
      .single()

    if (error) {
      console.error('Error creating custom request:', error)
      return null
    }

    return data
  }

  async getCustomRequests(): Promise<CustomRequest[]> {
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom requests:', error)
      return []
    }

    return data || []
  }

  async updateCustomRequestStatus(id: string, status: string, assignedTeamMember?: string): Promise<CustomRequest | null> {
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (assignedTeamMember) {
      updates.assigned_team_member = assignedTeamMember
    }

    const { data, error } = await supabase
      .from('custom_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating custom request:', error)
      return null
    }

    return data
  }

  // Lead operations
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return null
    }

    return data
  }

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      return []
    }

    return data || []
  }

  // Purchase operations
  async createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchase])
      .select()
      .single()

    if (error) {
      console.error('Error creating purchase:', error)
      return null
    }

    return data
  }

  async getPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        funnel:funnels(*),
        buyer:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchases:', error)
      return []
    }

    return data || []
  }

  async updatePurchaseStatus(id: string, paymentStatus: string): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from('purchases')
      .update({ 
        payment_status: paymentStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating purchase:', error)
      return null
    }

    return data
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    return data || []
  }

  async getAuctionTags(auctionId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('auction_tags')
      .select(`
        tag:tags(*)
      `)
      .eq('auction_id', auctionId)

    if (error) {
      console.error('Error fetching auction tags:', error)
      return []
    }

    return data?.map(item => item.tag).filter(Boolean) || []
  }

  // Lease operations
  async createLease(lease: Omit<Lease, 'id' | 'created_at' | 'updated_at'>): Promise<Lease | null> {
    const { data, error } = await supabase
      .from('leases')
      .insert([lease])
      .select()
      .single()

    if (error) {
      console.error('Error creating lease:', error)
      return null
    }

    return data
  }

  async getLeases(): Promise<Lease[]> {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        auction:auctions(*),
        funnel:funnels(*),
        renter:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leases:', error)
      return []
    }

    return data || []
  }

  // Utility methods for data transformation
  transformLegacyAuction(auction: Auction): any {
    return {
      id: auction.id,
      title: auction.title || '',
      description: auction.description || '',
      startingPrice: auction.starting_price,
      currentPrice: auction.current_price || auction.starting_price,
      buyNowPrice: auction.buy_now || null,
      startTime: auction.starts_at,
      endTime: auction.ends_at,
      status: auction.status,
      sellerId: auction.funnel?.id || '',
      winnerId: auction.winning_bid?.bidder_id,
      imageUrl: auction.funnel?.image_url || '/placeholder.jpg',
      tags: [], // Will be populated separately
      createdAt: auction.created_at,
      updatedAt: auction.updated_at
    }
  }

  transformLegacyBid(bid: Bid): any {
    return {
      id: bid.id,
      auctionId: bid.auction_id,
      bidderId: bid.bidder_id,
      amount: bid.amount,
      timestamp: bid.created_at,
      isWinning: false // Will be determined by business logic
    }
  }
}

export const databaseService = new DatabaseService()
