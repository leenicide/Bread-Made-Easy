#!/usr/bin/env tsx

import { databaseMigration } from '../lib/database-migration'

async function main() {
  try {
    console.log('🚀 Starting database initialization...')
    
    // Initialize the database with sample data
    await databaseMigration.initializeDatabase()
    
    // Create auction tag relationships
    await databaseMigration.createAuctionTags()
    
    console.log('✅ Database initialization completed successfully!')
    console.log('🎉 Your Bread-Made-Easy application is now ready with sample data!')
    
  } catch (error) {
    console.error('❌ Error during database initialization:', error)
    process.exit(1)
  }
}

// Run the initialization
main()
