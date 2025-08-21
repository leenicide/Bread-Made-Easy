import type { Purchase, CustomRequest, Lead } from "./types"

// Mock admin data and services
const mockStats = {
  totalRevenue: 45780,
  totalAuctions: 23,
  activeAuctions: 8,
  totalUsers: 156,
  newUsersThisMonth: 34,
  totalPurchases: 89,
  conversionRate: 12.5,
  averageOrderValue: 514,
}

const mockRecentPurchases: Purchase[] = [
  {
    id: "purchase_1",
    buyerId: "2",
    auctionId: "1",
    type: "buy_now",
    amount: 899,
    status: "completed",
    stripePaymentIntentId: "pi_123",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "purchase_2",
    buyerId: "buyer2",
    auctionId: "2",
    type: "auction_win",
    amount: 1200,
    status: "completed",
    stripePaymentIntentId: "pi_124",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

const mockCustomRequests: CustomRequest[] = [
  {
    id: "req_1",
    buyerId: "buyer3",
    title: "E-commerce Funnel for Fashion Brand",
    description: "Need a complete e-commerce funnel with product catalog, cart, and checkout for a fashion brand.",
    budget: 2500,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "open",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "req_2",
    buyerId: "buyer4",
    title: "SaaS Onboarding Flow",
    description: "Multi-step onboarding funnel for B2B SaaS with trial signup and feature introduction.",
    budget: 1800,
    status: "in_progress",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

const mockLeads: Lead[] = [
  {
    id: "lead_1",
    email: "john@example.com",
    name: "John Smith",
    source: "auction",
    status: "new",
    notes: "Interested in e-commerce funnels",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "lead_2",
    email: "sarah@startup.com",
    name: "Sarah Johnson",
    source: "custom_request",
    status: "qualified",
    notes: "Looking for SaaS lead generation system",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

export const adminService = {
  async getDashboardStats() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockStats
  },

  async getRecentPurchases() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockRecentPurchases
  },

  async getAllPurchases() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockRecentPurchases
  },

  async getCustomRequests() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockCustomRequests
  },

  async getLeads() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockLeads
  },

  async updateCustomRequestStatus(id: string, status: CustomRequest["status"]) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const request = mockCustomRequests.find((r) => r.id === id)
    if (request) {
      request.status = status
      request.updatedAt = new Date()
    }
    return request
  },

  async updateLeadStatus(id: string, status: Lead["status"], notes?: string) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const lead = mockLeads.find((l) => l.id === id)
    if (lead) {
      lead.status = status
      if (notes) lead.notes = notes
      lead.updatedAt = new Date()
    }
    return lead
  },
}
