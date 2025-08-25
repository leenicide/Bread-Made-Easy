import { supabase } from "@/lib/supabase-client"
import type { Lead } from "@/lib/types"

export const leadService = {
  // Fetch all leads
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data || []).map((lead) => ({
      ...lead,
      created_at: new Date(lead.created_at),
      updated_at: new Date(lead.updated_at),
    }))
  },

  // Create a new lead
  async createLead(email: string, phone_number?: string, username?: string): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .insert([{ email, phone_number, username }])
      .select()
      .single()

    if (error) throw error
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  },

  // Update an existing lead (for future status/notes handling)
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (error) throw error
  },
}
