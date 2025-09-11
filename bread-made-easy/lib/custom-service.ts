// lib/custom-request-service.ts
import { supabase } from './supabase-client';
import { CustomRequest } from './types';

export const customRequestService = {
  // Create a new custom request
  async createCustomRequest(requestData: Omit<CustomRequest, 'id' | 'created_at' | 'updated_at'>): Promise<CustomRequest> {
    const { data, error } = await supabase
      .from('custom_requests')
      .insert({
        name: requestData.name,
        email: requestData.email,
        company: requestData.company || null,
        phone: requestData.phone || null,
        projecttype: requestData.projecttype,
        industry: requestData.industry,
        targetaudience: requestData.targetaudience || null,
        primarygoal: requestData.primarygoal,
        pages: requestData.pages || [],
        features: requestData.features || [],
        timeline: requestData.timeline || null,
        budget: requestData.budget || null,
        inspiration: requestData.inspiration || null,
        additionalnotes: requestData.additionalnotes || null,
        preferredcontact: requestData.preferredcontact || 'email',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        quarter: getCurrentQuarter()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom request:', error);
      throw new Error(`Failed to create custom request: ${error.message}`);
    }

    return data as CustomRequest;
  },

  // Get all custom requests (for admin)
  async getCustomRequests(userId: string): Promise<CustomRequest[]> {
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom requests:', error);
      throw new Error(`Failed to fetch custom requests: ${error.message}`);
    }

    return data as CustomRequest[];
  },

  // Get custom requests by user email
  async getCustomRequestsByEmail(email: string): Promise<CustomRequest[]> {
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user custom requests:', error);
      throw new Error(`Failed to fetch user custom requests: ${error.message}`);
    }

    return data as CustomRequest[];
  },

  // Update custom request status (for admin)
  async updateCustomRequestStatus(id: string, status: string, assignedTeamMember?: string): Promise<CustomRequest> {
    const updateData: any = { status };
    if (assignedTeamMember) {
      updateData.assigned_team_member = assignedTeamMember;
    }

    const { data, error } = await supabase
      .from('custom_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom request:', error);
      throw new Error(`Failed to update custom request: ${error.message}`);
    }

    return data as CustomRequest;
  },

  // Delete custom request (for admin)
  async deleteCustomRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom request:', error);
      throw new Error(`Failed to delete custom request: ${error.message}`);
    }
  }
};

// Helper function to get current quarter
function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.floor((now.getMonth() + 3) / 3);
  const year = now.getFullYear();
  return `Q${quarter} ${year}`;
}