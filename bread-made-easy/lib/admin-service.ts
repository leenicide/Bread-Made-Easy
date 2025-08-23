import type { Purchase, CustomRequest, Lead } from "./types"
import { databaseService } from "./database"

export const adminService = {
  async getDashboardStats() {
    return await databaseService.getDashboardStats()
  },

  async getRecentPurchases() {
    const purchases = await databaseService.getAllPurchases()
    return purchases.slice(0, 10) // Return only recent 10
  },

  async getAllPurchases() {
    return await databaseService.getAllPurchases()
  },

  async getCustomRequests() {
    return await databaseService.getAllCustomRequests()
  },

  async getLeads() {
    return await databaseService.getAllLeads()
  },

  async updateCustomRequestStatus(id: string, status: CustomRequest["status"]) {
    return await databaseService.updateCustomRequestStatus(id, status)
  },

  async updateLeadStatus(id: string, status: Lead["status"], notes?: string) {
    return await databaseService.updateLeadStatus(id, status, notes)
  },

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
    return await databaseService.createLead(leadData)
  }
}
