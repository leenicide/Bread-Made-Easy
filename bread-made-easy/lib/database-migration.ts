import { supabase } from './auth'
import type { Funnel, Category, Tag, Auction, BuyNow } from './types'

export class DatabaseMigration {
  // Initialize database with sample data
  async initializeDatabase() {
    try {
      console.log('Starting database initialization...')
      
      // Create sample categories
      await this.createSampleCategories()
      
      // Create sample funnels
      await this.createSampleFunnels()
      
      // Create sample tags
      await this.createSampleTags()
      
      // Create sample auctions
      await this.createSampleAuctions()
      
      // Create sample buy now offers
      await this.createSampleBuyNowOffers()
      
      console.log('Database initialization completed successfully!')
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    }
  }

  private async createSampleCategories() {
    const categories = [
      { name: 'E-commerce' },
      { name: 'SaaS' },
      { name: 'Education' },
      { name: 'Health & Fitness' },
      { name: 'Real Estate' },
      { name: 'Digital Products' },
      { name: 'Lead Generation' },
      { name: 'Consulting' },
    ]

    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert([category], { onConflict: 'name' })
      
      if (error) {
        console.error(`Error creating category ${category.name}:`, error)
      }
    }
  }

  private async createSampleFunnels() {
    const funnels = [
      {
        funnel_id: 'ecommerce-funnel',
        title: 'High-Converting E-commerce Funnel',
        description: 'Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate across multiple industries.',
        active: true,
      },
      {
        funnel_id: 'saas-funnel',
        title: 'SaaS Lead Generation System',
        description: 'Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion.',
        active: true,
      },
      {
        funnel_id: 'course-funnel',
        title: 'Course Launch Funnel Template',
        description: 'Complete course launch sequence with early bird pricing, social proof integration, and payment plans.',
        active: true,
      },
      {
        funnel_id: 'fitness-funnel',
        title: 'Fitness Coaching Funnel',
        description: 'Complete fitness coaching funnel with consultation booking, payment processing, and client onboarding automation.',
        active: true,
      },
      {
        funnel_id: 'real-estate-funnel',
        title: 'Real Estate Lead Magnet',
        description: 'High-converting real estate funnel with property valuation tool, lead capture, and automated follow-up system.',
        active: true,
      },
      {
        funnel_id: 'digital-product-funnel',
        title: 'Digital Product Launch Kit',
        description: 'Complete digital product launch system with pre-launch pages, launch sequence, and post-launch automation.',
        active: true,
      },
    ]

    for (const funnel of funnels) {
      const { error } = await supabase
        .from('funnels')
        .upsert([funnel], { onConflict: 'funnel_id' })
      
      if (error) {
        console.error(`Error creating funnel ${funnel.funnel_id}:`, error)
      }
    }
  }

  private async createSampleTags() {
    const tags = [
      { name: 'ecommerce' },
      { name: 'conversion' },
      { name: 'automation' },
      { name: 'email-marketing' },
      { name: 'saas' },
      { name: 'lead-generation' },
      { name: 'webinar' },
      { name: 'b2b' },
      { name: 'course' },
      { name: 'education' },
      { name: 'launch' },
      { name: 'social-proof' },
      { name: 'fitness' },
      { name: 'coaching' },
      { name: 'consultation' },
      { name: 'real-estate' },
      { name: 'lead-capture' },
      { name: 'digital-products' },
      { name: 'affiliate' },
      { name: 'upsell' },
    ]

    for (const tag of tags) {
      const { error } = await supabase
        .from('tags')
        .upsert([tag], { onConflict: 'name' })
      
      if (error) {
        console.error(`Error creating tag ${tag.name}:`, error)
      }
    }
  }

  private async createSampleAuctions() {
    // Get categories and funnels for reference
    const { data: categories } = await supabase.from('categories').select('id, name')
    const { data: funnels } = await supabase.from('funnels').select('id, funnel_id')
    
    if (!categories || !funnels) {
      console.error('Could not fetch categories or funnels for auction creation')
      return
    }

    const ecommerceCategory = categories.find(c => c.name === 'E-commerce')
    const saasCategory = categories.find(c => c.name === 'SaaS')
    const educationCategory = categories.find(c => c.name === 'Education')
    
    const ecommerceFunnel = funnels.find(f => f.funnel_id === 'ecommerce-funnel')
    const saasFunnel = funnels.find(f => f.funnel_id === 'saas-funnel')
    const courseFunnel = funnels.find(f => f.funnel_id === 'course-funnel')

    const auctions = [
      {
        funnel_id: ecommerceFunnel?.id,
        title: 'High-Converting E-commerce Funnel',
        description: 'Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate across multiple industries.',
        category_id: ecommerceCategory?.id,
        status: 'active',
        starting_price: 500,
        current_price: 850,
        starts_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        funnel_id: saasFunnel?.id,
        title: 'SaaS Lead Generation System',
        description: 'Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion.',
        category_id: saasCategory?.id,
        status: 'active',
        starting_price: 800,
        current_price: 1200,
        starts_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        funnel_id: courseFunnel?.id,
        title: 'Course Launch Funnel Template',
        description: 'Complete course launch sequence with early bird pricing, social proof integration, and payment plans.',
        category_id: educationCategory?.id,
        status: 'active',
        starting_price: 400,
        current_price: 650,
        starts_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    for (const auction of auctions) {
      if (auction.funnel_id && auction.category_id) {
        const { error } = await supabase
          .from('auctions')
          .upsert([auction], { onConflict: 'id' })
        
        if (error) {
          console.error(`Error creating auction ${auction.title}:`, error)
        }
      }
    }
  }

  private async createSampleBuyNowOffers() {
    // Get funnels for reference
    const { data: funnels } = await supabase.from('funnels').select('id, funnel_id')
    
    if (!funnels) {
      console.error('Could not fetch funnels for buy now offer creation')
      return
    }

    const fitnessFunnel = funnels.find(f => f.funnel_id === 'fitness-funnel')
    const realEstateFunnel = funnels.find(f => f.funnel_id === 'real-estate-funnel')
    const digitalProductFunnel = funnels.find(f => f.funnel_id === 'digital-product-funnel')

    const buyNowOffers = [
      {
        funnel_id: fitnessFunnel?.id,
        price: 899,
        is_active: true,
      },
      {
        funnel_id: realEstateFunnel?.id,
        price: 649,
        is_active: true,
      },
      {
        funnel_id: digitalProductFunnel?.id,
        price: 799,
        is_active: true,
      },
    ]

    for (const offer of buyNowOffers) {
      if (offer.funnel_id) {
        const { error } = await supabase
          .from('by_now')
          .upsert([offer], { onConflict: 'funnel_id' })
        
        if (error) {
          console.error(`Error creating buy now offer for funnel ${offer.funnel_id}:`, error)
        }
      }
    }
  }

  // Create auction tags relationships
  async createAuctionTags() {
    try {
      const { data: auctions } = await supabase.from('auctions').select('id, title')
      const { data: tags } = await supabase.from('tags').select('id, name')
      
      if (!auctions || !tags) {
        console.error('Could not fetch auctions or tags for tag relationship creation')
        return
      }

      const auctionTags = []
      
      // E-commerce funnel tags
      const ecommerceAuction = auctions.find(a => a.title?.includes('E-commerce'))
      const ecommerceTags = tags.filter(t => ['ecommerce', 'conversion', 'automation', 'email-marketing'].includes(t.name))
      
      if (ecommerceAuction) {
        ecommerceTags.forEach(tag => {
          auctionTags.push({
            auction_id: ecommerceAuction.id,
            tag_id: tag.id,
          })
        })
      }

      // SaaS funnel tags
      const saasAuction = auctions.find(a => a.title?.includes('SaaS'))
      const saasTags = tags.filter(t => ['saas', 'lead-generation', 'webinar', 'b2b'].includes(t.name))
      
      if (saasAuction) {
        saasTags.forEach(tag => {
          auctionTags.push({
            auction_id: saasAuction.id,
            tag_id: tag.id,
          })
        })
      }

      // Course funnel tags
      const courseAuction = auctions.find(a => a.title?.includes('Course'))
      const courseTags = tags.filter(t => ['course', 'education', 'launch', 'social-proof'].includes(t.name))
      
      if (courseAuction) {
        courseTags.forEach(tag => {
          auctionTags.push({
            auction_id: courseAuction.id,
            tag_id: tag.id,
          })
        })
      }

      // Insert auction tags
      for (const auctionTag of auctionTags) {
        const { error } = await supabase
          .from('auction_tags')
          .upsert([auctionTag], { onConflict: 'auction_id,tag_id' })
        
        if (error) {
          console.error(`Error creating auction tag relationship:`, error)
        }
      }

      console.log('Auction tags created successfully!')
    } catch (error) {
      console.error('Error creating auction tags:', error)
    }
  }

  // Reset database (use with caution!)
  async resetDatabase() {
    try {
      console.log('Resetting database...')
      
      const tables = [
        'auction_tags',
        'bids',
        'auctions',
        'by_now',
        'custom_requests',
        'leads',
        'leases',
        'purchases',
        'tags',
        'categories',
        'funnels',
      ]

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Keep at least one row
        
        if (error) {
          console.error(`Error clearing table ${table}:`, error)
        }
      }

      console.log('Database reset completed!')
    } catch (error) {
      console.error('Error resetting database:', error)
      throw error
    }
  }
}

export const databaseMigration = new DatabaseMigration()

// Example usage:
// await databaseMigration.initializeDatabase()
// await databaseMigration.createAuctionTags()
// await databaseMigration.resetDatabase() // Use with caution!
