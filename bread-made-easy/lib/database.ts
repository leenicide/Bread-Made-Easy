import { supabase } from './auth'
import type { 
  User, 
  Auction, 
  Bid, 
  Purchase, 
  CustomRequest, 
  Lead,
  BidResponse 
} from './types'

// Database service for all Supabase operations
export const databaseService = {
  // Profile operations
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          role: updates.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  },

  // Auction operations
  async getAuctions(): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          categories(name),
          profiles!seller_id(name),
          auction_tags(
            tags(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(auction => ({
        id: auction.id,
        title: auction.title,
        description: auction.description,
        startingPrice: parseFloat(auction.starting_price),
        currentPrice: parseFloat(auction.current_price),
        buyNowPrice: auction.buy_now_price ? parseFloat(auction.buy_now_price) : undefined,
        startTime: new Date(auction.start_time),
        endTime: new Date(auction.end_time),
        status: auction.status,
        sellerId: auction.seller_id,
        winnerId: auction.winner_id,
        imageUrl: auction.image_url,
        category: auction.categories?.name || 'Uncategorized',
        tags: auction.auction_tags?.map((at: any) => at.tags.name) || [],
        createdAt: new Date(auction.created_at),
        updatedAt: new Date(auction.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching auctions:', error)
      return []
    }
  },

  async getAuction(id: string): Promise<Auction | null> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          categories(name),
          profiles!seller_id(name),
          auction_tags(
            tags(name)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startingPrice: parseFloat(data.starting_price),
        currentPrice: parseFloat(data.current_price),
        buyNowPrice: data.buy_now_price ? parseFloat(data.buy_now_price) : undefined,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        status: data.status,
        sellerId: data.seller_id,
        winnerId: data.winner_id,
        imageUrl: data.image_url,
        category: data.categories?.name || 'Uncategorized',
        tags: data.auction_tags?.map((at: any) => at.tags.name) || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error fetching auction:', error)
      return null
    }
  },

  async createAuction(auctionData: Omit<Auction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Auction | null> {
    try {
      // First, get or create category
      let categoryId = null
      if (auctionData.category) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('name', auctionData.category)
          .single()

        if (category) {
          categoryId = category.id
        } else {
          const { data: newCategory } = await supabase
            .from('categories')
            .insert({ name: auctionData.category })
            .select('id')
            .single()
          categoryId = newCategory?.id
        }
      }

      // Create auction
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          title: auctionData.title,
          description: auctionData.description,
          starting_price: auctionData.startingPrice,
          current_price: auctionData.startingPrice,
          buy_now_price: auctionData.buyNowPrice,
          start_time: auctionData.startTime.toISOString(),
          end_time: auctionData.endTime.toISOString(),
          status: auctionData.status,
          seller_id: auctionData.sellerId,
          image_url: auctionData.imageUrl,
          category_id: categoryId
        })
        .select()
        .single()

      if (error) throw error

      // Create tags if they don't exist and link them
      if (auctionData.tags && auctionData.tags.length > 0) {
        for (const tagName of auctionData.tags) {
          // Get or create tag
          let tagId = null
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()

          if (existingTag) {
            tagId = existingTag.id
          } else {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select('id')
              .single()
            tagId = newTag?.id
          }

          // Link tag to auction
          if (tagId) {
            await supabase
              .from('auction_tags')
              .insert({
                auction_id: data.id,
                tag_id: tagId
              })
          }
        }
      }

      return this.getAuction(data.id)
    } catch (error) {
      console.error('Error creating auction:', error)
      return null
    }
  },

  // Bid operations
  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          profiles!bidder_id(name)
        `)
        .eq('auction_id', auctionId)
        .order('timestamp', { ascending: false })

      if (error) throw error

      return data.map(bid => ({
        id: bid.id,
        auctionId: bid.auction_id,
        bidderId: bid.bidder_id,
        amount: parseFloat(bid.amount),
        timestamp: new Date(bid.timestamp),
        isWinning: bid.is_winning
      }))
    } catch (error) {
      console.error('Error fetching bids:', error)
      return []
    }
  },

  async placeBid(auctionId: string, bidderId: string, amount: number): Promise<BidResponse> {
    try {
      // Validate auction exists and is active
      const auction = await this.getAuction(auctionId)
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

      // Place bid
      const { data: bid, error } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          bidder_id: bidderId,
          amount: amount,
          is_winning: true
        })
        .select()
        .single()

      if (error) throw error

      // Get updated auction
      const updatedAuction = await this.getAuction(auctionId)

      return {
        success: true,
        bid: {
          id: bid.id,
          auctionId: bid.auction_id,
          bidderId: bid.bidder_id,
          amount: parseFloat(bid.amount),
          timestamp: new Date(bid.timestamp),
          isWinning: bid.is_winning
        },
        auction: updatedAuction
      }
    } catch (error) {
      console.error('Error placing bid:', error)
      return { success: false, error: "Failed to place bid" }
    }
  },

  async buyNow(auctionId: string, buyerId: string): Promise<BidResponse> {
    try {
      const auction = await this.getAuction(auctionId)
      if (!auction) {
        return { success: false, error: "Auction not found" }
      }

      if (auction.status !== "active") {
        return { success: false, error: "Auction is not active" }
      }

      if (!auction.buyNowPrice) {
        return { success: false, error: "Buy now option not available" }
      }

      // Update auction status
      const { error } = await supabase
        .from('auctions')
        .update({
          status: 'sold',
          winner_id: buyerId,
          current_price: auction.buyNowPrice,
          end_time: new Date().toISOString()
        })
        .eq('id', auctionId)

      if (error) throw error

      // Get updated auction
      const updatedAuction = await this.getAuction(auctionId)

      return { success: true, auction: updatedAuction }
    } catch (error) {
      console.error('Error processing buy now:', error)
      return { success: false, error: "Failed to process buy now" }
    }
  },

  // Purchase operations
  async createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purchase | null> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          buyer_id: purchaseData.buyerId,
          auction_id: purchaseData.auctionId,
          type: purchaseData.type,
          amount: purchaseData.amount,
          status: purchaseData.status,
          stripe_payment_intent_id: purchaseData.stripePaymentIntentId
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        buyerId: data.buyer_id,
        auctionId: data.auction_id,
        type: data.type,
        amount: parseFloat(data.amount),
        status: data.status,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      return null
    }
  },

  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(purchase => ({
        id: purchase.id,
        buyerId: purchase.buyer_id,
        auctionId: purchase.auction_id,
        type: purchase.type,
        amount: parseFloat(purchase.amount),
        status: purchase.status,
        stripePaymentIntentId: purchase.stripe_payment_intent_id,
        createdAt: new Date(purchase.created_at),
        updatedAt: new Date(purchase.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching purchases:', error)
      return []
    }
  },

  // Custom request operations
  async createCustomRequest(requestData: Omit<CustomRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomRequest | null> {
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .insert({
          buyer_id: requestData.buyerId,
          title: requestData.title,
          description: requestData.description,
          budget: requestData.budget,
          deadline: requestData.deadline?.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        buyerId: data.buyer_id,
        title: data.title,
        description: data.description,
        budget: parseFloat(data.budget),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating custom request:', error)
      return null
    }
  },

  async getCustomRequestsByUser(userId: string): Promise<CustomRequest[]> {
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(request => ({
        id: request.id,
        buyerId: request.buyer_id,
        title: request.title,
        description: request.description,
        budget: parseFloat(request.budget),
        deadline: request.deadline ? new Date(request.deadline) : undefined,
        status: request.status,
        createdAt: new Date(request.created_at),
        updatedAt: new Date(request.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching custom requests:', error)
      return []
    }
  },

  async updateCustomRequestStatus(id: string, status: CustomRequest['status']): Promise<CustomRequest | null> {
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        buyerId: data.buyer_id,
        title: data.title,
        description: data.description,
        budget: parseFloat(data.budget),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating custom request:', error)
      return null
    }
  },

  // Admin operations
  async getAllCustomRequests(): Promise<CustomRequest[]> {
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .select(`
          *,
          profiles!buyer_id(name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(request => ({
        id: request.id,
        buyerId: request.buyer_id,
        title: request.title,
        description: request.description,
        budget: parseFloat(request.budget),
        deadline: request.deadline ? new Date(request.deadline) : undefined,
        status: request.status,
        createdAt: new Date(request.created_at),
        updatedAt: new Date(request.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching all custom requests:', error)
      return []
    }
  },

  async getAllPurchases(): Promise<Purchase[]> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          profiles!buyer_id(name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(purchase => ({
        id: purchase.id,
        buyerId: purchase.buyer_id,
        auctionId: purchase.auction_id,
        type: purchase.type,
        amount: parseFloat(purchase.amount),
        status: purchase.status,
        stripePaymentIntentId: purchase.stripe_payment_intent_id,
        createdAt: new Date(purchase.created_at),
        updatedAt: new Date(purchase.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching all purchases:', error)
      return []
    }
  },

  async getDashboardStats() {
    try {
      // Get total revenue
      const { data: revenueData } = await supabase
        .from('purchases')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = revenueData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0

      // Get auction counts
      const { count: totalAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true })

      const { count: activeAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get purchase counts
      const { count: totalPurchases } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Calculate conversion rate (simplified)
      const conversionRate = totalUsers > 0 ? (totalPurchases / totalUsers) * 100 : 0

      // Calculate average order value
      const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalAuctions: totalAuctions || 0,
        activeAuctions: activeAuctions || 0,
        totalUsers: totalUsers || 0,
        newUsersThisMonth: 0, // Would need more complex query
        totalPurchases: totalPurchases || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalRevenue: 0,
        totalAuctions: 0,
        activeAuctions: 0,
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalPurchases: 0,
        conversionRate: 0,
        averageOrderValue: 0
      }
    }
  },

  // Lead operations (admin only)
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          email: leadData.email,
          name: leadData.name,
          source: leadData.source,
          status: leadData.status,
          notes: leadData.notes
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        source: data.source,
        status: data.status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      return null
    }
  },

  async getAllLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(lead => ({
        id: lead.id,
        email: lead.email,
        name: lead.name,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  },

  async updateLeadStatus(id: string, status: Lead['status'], notes?: string): Promise<Lead | null> {
    try {
      const updateData: any = { status }
      if (notes) updateData.notes = notes

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        source: data.source,
        status: data.status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      return null
    }
  }
}
