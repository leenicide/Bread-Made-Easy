import type { Auction, Bid, BidResponse } from "./types"
import { databaseService } from "./database"

export interface BidResponse {
  success: boolean
  bid?: Bid
  auction?: Auction
  error?: string
}

export const auctionService = {
  async getAuction(id: string): Promise<Auction | null> {
    return await databaseService.getAuction(id)
  },

  async getAuctions(): Promise<Auction[]> {
    return await databaseService.getAuctions()
  },

  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    return await databaseService.getBidsForAuction(auctionId)
  },

  async placeBid(auctionId: string, bidderId: string, amount: number): Promise<BidResponse> {
    return await databaseService.placeBid(auctionId, bidderId, amount)
  },

  async buyNow(auctionId: string, buyerId: string): Promise<BidResponse> {
    return await databaseService.buyNow(auctionId, buyerId)
  },

  async createAuction(auctionData: Omit<Auction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Auction | null> {
    return await databaseService.createAuction(auctionData)
  }
}
