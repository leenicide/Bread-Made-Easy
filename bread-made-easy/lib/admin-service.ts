import type { Lead, CustomRequest, Purchase, Auction, User } from "./types"
import { databaseService } from "./database-service"

// Mock data for fallback - kept for development/testing
const mockLeads: Lead[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    phone_number: "+1-555-0123",
    username: "johndoe",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    phone_number: "+1-555-0456",
    username: "janesmith",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    email: "bob.wilson@example.com",
    phone_number: "+1-555-0789",
    username: "bobwilson",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
]

const mockCustomRequests: CustomRequest[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    company: "TechCorp Inc",
    phone: "+1-555-0123",
    projecttype: "E-commerce Funnel",
    industry: "Technology",
    targetaudience: "Small business owners",
    primarygoal: "Increase online sales",
    pages: ["Landing Page", "Sales Page", "Checkout Page"],
    features: ["Payment Processing", "Email Integration", "Analytics"],
    timeline: "3 months",
    budget: "$5,000 - $10,000",
    inspiration: "Amazon checkout flow",
    additionalnotes: "Need mobile-first design",
    preferredcontact: "Email",
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "pending",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    company: "HealthPlus",
    phone: "+1-555-0456",
    projecttype: "Lead Generation Funnel",
    industry: "Healthcare",
    targetaudience: "Fitness enthusiasts",
    primarygoal: "Generate qualified leads",
    pages: ["Landing Page", "Lead Capture", "Thank You Page"],
    features: ["CRM Integration", "Email Automation", "Lead Scoring"],
    timeline: "2 months",
    budget: "$3,000 - $7,000",
    inspiration: "Peloton signup flow",
    additionalnotes: "HIPAA compliance required",
    preferredcontact: "Phone",
    submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "in_progress",
    assigned_team_member: "Sarah Johnson",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const mockPurchases: Purchase[] = [
  {
    id: "1",
    note: "buy_now",
    funnel_id: "funnel-1",
    buyer_id: "user-1",
    amount: 899,
    payment_status: "completed",
    type: "stripe",
    stripe_payment_intent_id: "pi_123456789",
    provider_fee: 25.97,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    note: "auction",
    funnel_id: "funnel-2",
    buyer_id: "user-2",
    amount: 1200,
    payment_status: "completed",
    type: "stripe",
    stripe_payment_intent_id: "pi_987654321",
    provider_fee: 34.80,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const mockAuctions: Auction[] = [
  {
    id: "1",
    title: "High-Converting E-commerce Funnel",
    description: "Complete sales funnel with cart abandonment sequences",
    starting_price: 500,
    current_price: 850,
    status: "active",
    starts_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "SaaS Lead Generation System",
    description: "Multi-step lead magnet funnel with webinar integration",
    starting_price: 800,
    current_price: 1200,
    status: "active",
    starts_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
]

export const adminService = {
  // Lead operations
  async getLeads(): Promise<Lead[]> {
    try {
      // Try to get leads from database first
      const dbLeads = await databaseService.getLeads()
      if (dbLeads.length > 0) {
        return dbLeads
      }
      
      // Fallback to mock data if database is empty
      console.log('No leads found in database, using mock data')
      return mockLeads
    } catch (error) {
      console.error('Error fetching leads from database, using mock data:', error)
      return mockLeads
    }
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> {
    try {
      // Try to create lead in database first
      const dbLead = await databaseService.createLead(lead)
      if (dbLead) {
        return dbLead
      }
      
      // Fallback to mock creation
      const newLead: Lead = {
        ...lead,
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        updated_at: new Date(),
      }
      mockLeads.push(newLead)
      return newLead
    } catch (error) {
      console.error('Error creating lead in database, using mock creation:', error)
      const newLead: Lead = {
        ...lead,
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        updated_at: new Date(),
      }
      mockLeads.push(newLead)
      return newLead
    }
  },

  // Custom Request operations
  async getCustomRequests(): Promise<CustomRequest[]> {
    try {
      // Try to get custom requests from database first
      const dbRequests = await databaseService.getCustomRequests()
      if (dbRequests.length > 0) {
        return dbRequests
      }
      
      // Fallback to mock data if database is empty
      console.log('No custom requests found in database, using mock data')
      return mockCustomRequests
    } catch (error) {
      console.error('Error fetching custom requests from database, using mock data:', error)
      return mockCustomRequests
    }
  },

  async updateCustomRequestStatus(id: string, status: string, assignedTeamMember?: string): Promise<CustomRequest | null> {
    try {
      // Try to update custom request in database first
      const dbRequest = await databaseService.updateCustomRequestStatus(id, status, assignedTeamMember)
      if (dbRequest) {
        return dbRequest
      }
      
      // Fallback to mock update
      const request = mockCustomRequests.find(r => r.id === id)
      if (request) {
        request.status = status
        if (assignedTeamMember) {
          request.assigned_team_member = assignedTeamMember
        }
        request.updated_at = new Date()
        return request
      }
      return null
    } catch (error) {
      console.error('Error updating custom request in database, using mock update:', error)
      const request = mockCustomRequests.find(r => r.id === id)
      if (request) {
        request.status = status
        if (assignedTeamMember) {
          request.assigned_team_member = assignedTeamMember
        }
        request.updated_at = new Date()
        return request
      }
      return null
    }
  },

  // Purchase operations
  async getPurchases(): Promise<Purchase[]> {
    try {
      // Try to get purchases from database first
      const dbPurchases = await databaseService.getPurchases()
      if (dbPurchases.length > 0) {
        return dbPurchases
      }
      
      // Fallback to mock data if database is empty
      console.log('No purchases found in database, using mock data')
      return mockPurchases
    } catch (error) {
      console.error('Error fetching purchases from database, using mock data:', error)
      return mockPurchases
    }
  },

  // Auction operations
  async getAuctions(): Promise<Auction[]> {
    try {
      // Try to get auctions from database first
      const dbAuctions = await databaseService.getAuctions()
      if (dbAuctions.length > 0) {
        return dbAuctions
      }
      
      // Fallback to mock data if database is empty
      console.log('No auctions found in database, using mock data')
      return mockAuctions
    } catch (error) {
      console.error('Error fetching auctions from database, using mock data:', error)
      return mockAuctions
    }
  },

  // Statistics methods
  async getStats() {
    try {
      const [leads, requests, purchases, auctions] = await Promise.all([
        this.getLeads(),
        this.getCustomRequests(),
        this.getPurchases(),
        this.getAuctions(),
      ])

      const totalRevenue = purchases
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)

      const pendingRequests = requests.filter(r => r.status === 'pending').length
      const activeAuctions = auctions.filter(a => a.status === 'active').length

      return {
        totalLeads: leads.length,
        totalRequests: requests.length,
        pendingRequests,
        totalRevenue,
        activeAuctions,
        totalPurchases: purchases.length,
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        totalLeads: 0,
        totalRequests: 0,
        pendingRequests: 0,
        totalRevenue: 0,
        activeAuctions: 0,
        totalPurchases: 0,
      }
    }
  },

  // Legacy methods for backward compatibility
  async getLegacyLeads(): Promise<any[]> {
    const leads = await this.getLeads()
    return leads.map(lead => ({
      id: lead.id,
      email: lead.email,
      name: lead.username,
      source: 'direct_sale' as const,
      status: 'new' as const,
      notes: '',
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    }))
  },

  async getLegacyCustomRequests(): Promise<any[]> {
    const requests = await this.getCustomRequests()
    return requests.map(request => ({
      id: request.id,
      buyerId: request.email, // Using email as buyer ID for legacy compatibility
      title: request.projecttype,
      description: request.additionalnotes || '',
      budget: parseFloat(request.budget?.replace(/[^0-9.]/g, '') || '0'),
      deadline: request.timeline ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // Estimate 30 days from timeline
      status: request.status as any,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
    }))
  },

  async getLegacyPurchases(): Promise<any[]> {
    const purchases = await this.getPurchases()
    return purchases.map(purchase => ({
      id: purchase.id,
      buyerId: purchase.buyer_id,
      auctionId: undefined, // Not available in new schema
      type: purchase.note === 'auction' ? 'auction_win' : 'buy_now',
      amount: purchase.amount,
      status: purchase.payment_status as any,
      stripePaymentIntentId: purchase.stripe_payment_intent_id,
      createdAt: purchase.created_at,
      updatedAt: purchase.updated_at,
    }))
  }
}
