// lib/lead-source-service.ts
import { supabase } from "@/lib/supabase-client"
import type { LeadSource } from "@/lib/types"

export const leadSourceService = {
  // Fetch leads from both custom_requests and bids with offer_amount
  async getLeads(): Promise<LeadSource[]> {
    const leads: LeadSource[] = [];
    
    try {
      // Get custom requests
      const { data: customRequests, error: requestsError } = await supabase
        .from("custom_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (requestsError) throw requestsError

      // Add custom requests to leads
      if (customRequests) {
        customRequests.forEach(request => {
          leads.push({
            id: request.id,
            email: request.email,
            name: request.name,
            phone: request.phone,
            company: request.company,
            source: 'custom_request',
            project_type: request.projecttype,
            budget: request.budget,
            status: request.status,
            industry: request.industry,
            targetaudience: request.targetaudience,
            primarygoal: request.primarygoal,
            pages: request.pages,
            features: request.features,
            timeline: request.timeline,
            inspiration: request.inspiration,
            additionalnotes: request.additionalnotes,
            preferredcontact: request.preferredcontact,
            created_at: new Date(request.created_at),
          });
        });
      }

      // Get bids with offer_amount (custom offers)
      const { data: bids, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .not('offer_amount', 'is', null)
        .order("created_at", { ascending: false })

      if (bidsError) throw bidsError

      // Get user emails and profiles separately
      if (bids && bids.length > 0) {
        // Extract unique bidder IDs
        const bidderIds = [...new Set(bids.map(bid => bid.bidder_id))];
        
        // Fetch user emails using the RPC function
        const { data: users, error: usersError } = await supabase
          .rpc('get_user_emails', { user_ids: bidderIds });

        if (usersError) {
          console.error("Error fetching users via RPC:", usersError);
        }

        // Fetch user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", bidderIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Create maps for easy lookup
        const userMap = new Map();
        users?.forEach(user => {
          userMap.set(user.id, { 
            email: user.email, 
            phone: user.phone 
          });
        });

        const profileMap = new Map();
        profiles?.forEach(profile => {
          profileMap.set(profile.id, { 
            display_name: profile.display_name 
          });
        });

        // Add bids with offer_amount to leads
        bids.forEach(bid => {
          const userData = userMap.get(bid.bidder_id);
          const profileData = profileMap.get(bid.bidder_id);
          
          const email = userData?.email || 'Unknown';
          const name = profileData?.display_name || 'Unknown';
          const phone = userData?.phone || null;
          
          leads.push({
            id: bid.id,
            email: email,
            name: name,
            phone: phone,
            source: 'bid_offer',
            offer_amount: bid.offer_amount,
            auction_id: bid.auction_id,
            bidder_id: bid.bidder_id,
            created_at: new Date(bid.created_at),
          });
        });
      }

      // Sort all leads by creation date
      return leads.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },
}