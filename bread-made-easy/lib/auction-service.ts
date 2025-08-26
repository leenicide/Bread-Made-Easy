import type { Auction, Bid } from "./types";
import { databaseService } from "./database-service";
import { supabase } from "./supabase-client";

// Extended mock auction data with more details - kept for fallback
const mockAuctions: Auction[] = [
    {
        id: "1",
        title: "High-Converting E-commerce Funnel",
        description:
            "Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate across multiple industries. Includes landing pages, checkout flow, thank you pages, and automated email sequences.",
        starting_price: 500,
        current_price: 850,
        status: "active",
        starts_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 1 day ago
        ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: "2",
        title: "SaaS Lead Generation System",
        description:
            "Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion rate. Features include landing pages, webinar registration, email sequences, and CRM integration.",
        starting_price: 800,
        current_price: 1200,
        status: "active",
        starts_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // Started 12 hours ago
        ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000), // Ends in 5 hours
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
        id: "3",
        title: "Course Launch Funnel Template",
        description:
            "Complete course launch sequence with early bird pricing, social proof integration, and payment plans. Includes pre-launch pages, launch sequence, upsells, and post-launch follow-up automation.",
        starting_price: 400,
        current_price: 650,
        status: "active",
        starts_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // Started 6 hours ago
        ends_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Ends in 1 day
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
];

const mockBids: Bid[] = [
    {
        id: "bid1",
        auction_id: "1",
        bidder_id: "user1",
        amount: 850,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: "bid2",
        auction_id: "1",
        bidder_id: "user2",
        amount: 800,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
        id: "bid3",
        auction_id: "2",
        bidder_id: "user3",
        amount: 1200,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
];

export const auctionService = {
    async updateAuction(
        id: string,
        updates: Partial<Auction>
    ): Promise<Auction | null> {
        try {
            // Try to update auction in database first
            const dbAuction = await databaseService.updateAuction(id, updates);
            if (dbAuction) {
                return dbAuction;
            }

            // Fallback to mock update
            const index = mockAuctions.findIndex((a) => a.id === id);
            if (index === -1) return null;

            const updatedAuction: Auction = {
                ...mockAuctions[index],
                ...updates,
                updated_at: new Date(),
            };
            mockAuctions[index] = updatedAuction;
            return updatedAuction;
        } catch (error) {
            console.error(
                "Error updating auction in database, using mock update:",
                error
            );

            const index = mockAuctions.findIndex((a) => a.id === id);
            if (index === -1) return null;

            const updatedAuction: Auction = {
                ...mockAuctions[index],
                ...updates,
                updated_at: new Date(),
            };
            mockAuctions[index] = updatedAuction;
            return updatedAuction;
        }
    },
    async getAuctions(): Promise<Auction[]> {
        const { data, error } = await supabase
            .from("auctions")
            .select(
                `
            *,
            funnel:funnels(*, category:categories(*)),
            winning_bid:bids!winning_bid_id(*)  
          `
            )
            .order("ends_at", { ascending: true });

        console.log("Fetched auctions:", data);

        if (error) {
            console.error("Error fetching auctions:", error);
            return [];
        }

        return data || [];
    },

    async getAuctionById(id: string): Promise<Auction | null> {
        const { data, error } = await supabase
            .from("auctions")
            .select(
                `
            *,
            funnel:funnels(*, category:categories(*)),
            winning_bid:bids!winning_bid_id(*)
          `
            )
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching auction:", error);
            return null;
        }

        // Get bids separately to avoid the relationship conflict
        const { data: bidsData } = await supabase
            .from("bids")
            .select("*")
            .eq("auction_id", id)
            .order("amount", { ascending: false });

        return {
            ...data,
            bids: bidsData || [],
        };
    },

    async getBidsByAuction(auctionId: string): Promise<Bid[]> {
        try {
            // Try to get bids from database first
            const dbBids = await databaseService.getBidsByAuction(auctionId); // Remove extra argument
            if (dbBids.length > 0) {
                return dbBids;
            }

            // Fallback to mock data
            return mockBids.filter((bid) => bid.auction_id === auctionId);
        } catch (error) {
            console.error(
                "Error fetching bids from database, using mock data:",
                error
            );
            return mockBids.filter((bid) => bid.auction_id === auctionId);
        }
    },

    // Add this method to the auctionService object in auction-service.ts
    // In auction-service.ts, update the placeBid method
    async placeBid(
        auctionId: string,
        userId: string,
        amount: number
    ): Promise<{
        success: boolean;
        error?: string;
        auction?: Auction;
        bidId?: string;
    }> {
        try {
            // First create the bid
            const bid = await this.createBid({
                auction_id: auctionId,
                bidder_id: userId,
                amount,
            });

            if (!bid) {
                return { success: false, error: "Failed to create bid" };
            }

            // Then update the auction with the new current price
            const updatedAuction = await this.updateAuction(auctionId, {
                current_price: amount,
                winning_bid_id: bid.id,
            });

            if (!updatedAuction) {
                return { success: false, error: "Failed to update auction" };
            }

            return { success: true, auction: updatedAuction, bidId: bid.id };
        } catch (error) {
            console.error("Error placing bid:", error);
            return { success: false, error: "An unexpected error occurred" };
        }
    },

    async createBid(bid: Omit<Bid, "id" | "created_at">): Promise<Bid | null> {
        try {
            // Try to create bid in database first
            const dbBid = await databaseService.createBid(bid);
            if (dbBid) {
                return dbBid;
            }

            // Fallback to mock creation
            const newBid: Bid = {
                ...bid,
                id: `bid_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                created_at: new Date(),
            };
            mockBids.push(newBid);
            return newBid;
        } catch (error) {
            console.error(
                "Error creating bid in database, using mock creation:",
                error
            );
            const newBid: Bid = {
                ...bid,
                id: `bid_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                created_at: new Date(),
            };
            mockBids.push(newBid);
            return newBid;
        }
    },

    async updateBidOffer(
        bidId: string,
        offerAmount: number
    ): Promise<Bid | null> {
        try {
            // Try to update bid in database first
            const dbBid = await databaseService.updateBid(bidId, {
                offer_amount: offerAmount,
            });
            if (dbBid) {
                return dbBid;
            }

            // Fallback to mock update
            const index = mockBids.findIndex((b) => b.id === bidId);
            if (index === -1) return null;

            const updatedBid: Bid = {
                ...mockBids[index],
                offer_amount: offerAmount,
            };
            mockBids[index] = updatedBid;
            return updatedBid;
        } catch (error) {
            console.error("Error updating bid offer:", error);
            return null;
        }
    },

    async createAuction(
        auction: Omit<Auction, "id" | "created_at" | "updated_at">
    ): Promise<Auction | null> {
        try {
            // Try to create auction in database first
            const dbAuction = await databaseService.createAuction(auction);
            if (dbAuction) {
                return dbAuction;
            }

            // Fallback to mock creation
            const newAuction: Auction = {
                ...auction,
                id: `auction_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockAuctions.push(newAuction);
            return newAuction;
        } catch (error) {
            console.error(
                "Error creating auction in database, using mock creation:",
                error
            );
            const newAuction: Auction = {
                ...auction,
                id: `auction_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockAuctions.push(newAuction);
            return newAuction;
        }
    },

    // Helper method to get legacy format for backward compatibility
    async getLegacyAuctions(): Promise<any[]> {
        const auctions = await this.getAuctions();
        return auctions.map((auction) =>
            databaseService.transformLegacyAuction(auction)
        );
    },

    // Helper method to get legacy format for backward compatibility
    async getLegacyBids(): Promise<any[]> {
        const bids = await this.getBidsByAuction("all");
        return bids.map((bid) => databaseService.transformLegacyBid(bid));
    },
};
