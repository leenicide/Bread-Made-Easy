// lib/funnel-service.ts
import { supabase } from "@/lib/supabase-client"
import type { Funnel,Category } from "./types"

export class FunnelService {
  // Get all active funnels
  async getFunnels(): Promise<Funnel[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching funnels:', error)
      return []
    }

    return data || []
  }

  // Get funnel by ID
  async getFunnelById(id: string): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching funnel:', error)
      return null
    }

    return data
  }

  // Get funnel by funnel_id (public identifier)
  async getFunnelByFunnelId(funnelId: string): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('funnel_id', funnelId)
      .single()

    if (error) {
      console.error('Error fetching funnel:', error)
      return null
    }

    return data
  }

  // Create a new funnel
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  // Create a new category
  async createCategory(name: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return null
    }

    return data
  }

  // Get funnel with category information
  async getFunnelByIdWithCategory(id: string): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching funnel with category:', error)
      return null
    }

    return data
  }

  // Get all funnels with category information
  async getFunnelsWithCategories(): Promise<Funnel[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching funnels with categories:', error)
      return []
    }

    return data || []
  }

  // Update createFunnel to include category_id
  async createFunnel(funnelData: {
    title: string
    description?: string
    image_url?: string
    category_id?: string
    is_available_for_lease?: boolean

  }): Promise<Funnel | null> {
    // Generate a unique funnel_id
    const funnelId = this.generateFunnelId(funnelData.title)
    
    const funnel = {
      funnel_id: funnelId,
      title: funnelData.title,
      description: funnelData.description || null,
      image_url: funnelData.image_url || null,
      category_id: funnelData.category_id || null,
      is_available_for_lease: funnelData.is_available_for_lease || false,

      active: true
    }

    const { data, error } = await supabase
      .from('funnels')
      .insert([funnel])
      .select()
      .single()

    if (error) {
      console.error('Error creating funnel:', error)
      return null
    }

    return data
  }

  // Update an existing funnel
  async updateFunnel(id: string, updates: Partial<Funnel>): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating funnel:', error)
      return null
    }

    return data
  }

  // Delete a funnel (soft delete by setting active to false)
  async deleteFunnel(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('funnels')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error deleting funnel:', error)
      return false
    }

    return true
  }

  // Upload funnel image to Supabase Storage
  async uploadFunnelImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `funnel-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('funnels')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('funnels')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading funnel image:', error)
      return null
    }
  }

  // Generate a unique funnel ID from title
  private generateFunnelId(title: string): string {
    // Convert title to lowercase, replace spaces with hyphens, remove special chars
    const baseId = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36)
    
    return `${baseId}-${timestamp}`
  }
}

export const funnelService = new FunnelService()