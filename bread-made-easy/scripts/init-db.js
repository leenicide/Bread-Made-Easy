#!/usr/bin/env node

/**
 * Database Initialization Script for Bread Made Easy
 * 
 * This script helps initialize the database with sample data.
 * Run this after setting up the schema in Supabase.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual values
const SUPABASE_URL = 'https://oedkzwoxhvitsbarbnck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGt6d294aHZpdHNiYXJibmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzQ5MzksImV4cCI6MjA3MTM1MDkzOX0.Ypmq463kK0Iwq1mYWfqrxzTv-qoPBSxzWV-zE8XOZlk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n🔍 Checking database tables...');
  
  const tables = [
    'profiles',
    'auctions',
    'bids',
    'purchases',
    'custom_requests',
    'leads',
    'categories',
    'tags',
    'auction_tags'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }
}

async function checkSampleData() {
  console.log('\n🔍 Checking sample data...');
  
  try {
    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.log('❌ Categories:', catError.message);
    } else {
      console.log(`✅ Categories: ${categories.length} found`);
    }
    
    // Check tags
    const { data: tags, error: tagError } = await supabase
      .from('tags')
      .select('*');
    
    if (tagError) {
      console.log('❌ Tags:', tagError.message);
    } else {
      console.log(`✅ Tags: ${tags.length} found`);
    }
    
    // Check auctions
    const { data: auctions, error: auctionError } = await supabase
      .from('auctions')
      .select('*');
    
    if (auctionError) {
      console.log('❌ Auctions:', auctionError.message);
    } else {
      console.log(`✅ Auctions: ${auctions.length} found`);
    }
    
  } catch (error) {
    console.error('❌ Error checking sample data:', error.message);
  }
}

async function createTestProfile() {
  console.log('\n🔍 Creating test profile...');
  
  try {
    // First check if we have any profiles
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Error checking profiles:', checkError.message);
      return;
    }
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Profiles already exist, skipping creation');
      return;
    }
    
    // Create a test profile
    const { data: profile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'test@example.com',
          name: 'Test User',
          role: 'buyer'
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating test profile:', createError.message);
    } else {
      console.log('✅ Test profile created:', profile.id);
    }
    
  } catch (error) {
    console.error('❌ Error creating test profile:', error.message);
  }
}

async function main() {
  console.log('🚀 Bread Made Easy - Database Initialization\n');
  
  // Check connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Check tables
  await checkTables();
  
  // Check sample data
  await checkSampleData();
  
  // Create test profile if needed
  await createTestProfile();
  
  console.log('\n✅ Database initialization check complete!');
  console.log('\n📋 Next steps:');
  console.log('1. If tables are missing, run the schema file in Supabase SQL Editor');
  console.log('2. If sample data is missing, run the seed data file in Supabase SQL Editor');
  console.log('3. Test the application to ensure everything is working');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
