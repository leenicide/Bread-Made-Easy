import { Bid } from "@/lib/types"
import { databaseService } from "./database-service"

export const bidService = {
  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    try {
      return await databaseService.getBidsByAuction(auctionId)
    } catch (error) {
      console.error('Error fetching bids from database:', error)
      return []
    }
  },

  async createBid(bid: Omit<Bid, 'id' | 'created_at'>): Promise<Bid | null> {
    try {
      return await databaseService.createBid(bid)
    } catch (error) {
      console.error('Error creating bid in database:', error)
      return null
    }
  },

  async getBidById(id: string): Promise<Bid | null> {
    try {
      return await databaseService.getBidById(id)
    } catch (error) {
      console.error('Error fetching bid from database:', error)
      return null
    }
  },

  async getUserBids(userId: string): Promise<Bid[]> {
    try {
      return await databaseService.getUserBids(userId)
    } catch (error) {
      console.error('Error fetching user bids from database:', error)
      return []
    }
  },

  async getLegacyBids(): Promise<any[]> {
    try {
      const bids = await this.getBidsByAuction('all')
      return bids.map(bid => databaseService.transformLegacyBid(bid))
    } catch (error) {
      console.error('Error fetching legacy bids:', error)
      return []
    }
  }
}