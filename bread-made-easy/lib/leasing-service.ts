// lib/leasing-service.ts
import { supabase } from "./supabase-client"
import type { LeaseRequest } from "./types"

export const leasingService = {
  async createLeaseRequest(
    requestData: Omit<LeaseRequest, "id" | "created_at" | "updated_at">
  ): Promise<LeaseRequest> {
    const { data, error } = await supabase
      .from("lease_requests")
      .insert({
        name: requestData.name,
        email: requestData.email,
        company: requestData.company || null,
        phone: requestData.phone || null,
        project_type: requestData.project_type,
        industry: requestData.industry,
        target_audience: requestData.target_audience || null,
        primary_goal: requestData.primary_goal,
        pages: requestData.pages || [],
        features: requestData.features || [],
        integrations: requestData.integrations || [],
        inspiration: requestData.inspiration || null,
        additional_notes: requestData.additional_notes || null,
        preferred_contact: requestData.preferred_contact || "email",
        lease_type: requestData.lease_type || "performance_based",
        estimated_revenue: requestData.estimated_revenue || null,
        status: "pending",
        submitted_at: new Date().toISOString(),
        quarter: getCurrentQuarter()
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating lease request:", error)
      throw new Error(`Failed to create lease request: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async updateLeaseRequest(id: string, updates: Partial<LeaseRequest>): Promise<LeaseRequest> {
    const { data, error } = await supabase
      .from("lease_requests")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating lease request fields:", error)
      throw new Error(`Failed to update lease request: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async createDraftFromStep1(params: {
    name?: string
    email: string
    company?: string | null
    phone?: string | null
  }): Promise<LeaseRequest> {
    const { data, error } = await supabase
      .from("lease_requests")
      .insert({
        name: params.name || "Anonymous",
        email: params.email,
        company: params.company ?? null,
        phone: params.phone ?? null,
        // placeholders for NOT NULL fields
        project_type: "TBD",
        industry: "TBD",
        primary_goal: "TBD",
        pages: [],
        features: [],
        integrations: [],
        preferred_contact: "email",
        lease_type: "performance_based",
        estimated_revenue: null,
        status: "pending",
        submitted_at: new Date().toISOString(),
        quarter: getCurrentQuarter(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating draft lease request:", error)
      throw new Error(`Failed to create draft lease request: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async getLeaseRequests(): Promise<LeaseRequest[]> {
    const { data, error } = await supabase
      .from("lease_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching lease requests:", error)
      throw new Error(`Failed to fetch lease requests: ${error.message}`)
    }

    return data as LeaseRequest[]
  },

  async getLeaseRequestsByEmail(email: string): Promise<LeaseRequest[]> {
    const { data, error } = await supabase
      .from("lease_requests")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user lease requests:", error)
      throw new Error(`Failed to fetch user lease requests: ${error.message}`)
    }

    return data as LeaseRequest[]
  },

  async getLeaseRequestById(id: string): Promise<LeaseRequest> {
    const { data, error } = await supabase
      .from("lease_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching lease request:", error)
      throw new Error(`Failed to fetch lease request: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async updateLeaseRequestStatus(
    id: string,
    status: string,
    assignedTeamMember?: string
  ): Promise<LeaseRequest> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (assignedTeamMember) {
      updateData.assigned_team_member = assignedTeamMember
    }

    const { data, error } = await supabase
      .from("lease_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating lease request:", error)
      throw new Error(`Failed to update lease request: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async updateLeaseRequestRevenue(
    id: string,
    estimatedRevenue: number
  ): Promise<LeaseRequest> {
    const { data, error } = await supabase
      .from("lease_requests")
      .update({
        estimated_revenue: estimatedRevenue,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating lease request revenue:", error)
      throw new Error(`Failed to update lease request revenue: ${error.message}`)
    }

    return data as LeaseRequest
  },

  async deleteLeaseRequest(id: string): Promise<void> {
    const { error } = await supabase.from("lease_requests").delete().eq("id", id)

    if (error) {
      console.error("Error deleting lease request:", error)
      throw new Error(`Failed to delete lease request: ${error.message}`)
    }
  },

  async getLeaseRequestsByStatus(status: string): Promise<LeaseRequest[]> {
    const { data, error } = await supabase
      .from("lease_requests")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching lease requests by status:", error)
      throw new Error(`Failed to fetch lease requests by status: ${error.message}`)
    }

    return data as LeaseRequest[]
  }
}

function getCurrentQuarter(): string {
  const now = new Date()
  const quarter = Math.floor((now.getMonth() + 3) / 3)
  const year = now.getFullYear()
  return `Q${quarter} ${year}`
}
