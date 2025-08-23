# Database Setup Guide for Bread Made Easy

This guide will help you set up the Supabase database to replace all mock data with real database operations.

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com))
2. Your Supabase project URL and anon key (already configured in `lib/auth.ts`)

## Step 1: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click "Run" to execute the schema creation

This will create:
- All necessary tables with proper relationships
- Custom types and enums
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic updates
- Default categories and tags

## Step 2: Verify Schema Creation

After running the schema, verify that these tables were created:
- `profiles` - User profiles
- `auctions` - Auction listings
- `bids` - Auction bids
- `purchases` - Completed transactions
- `custom_requests` - Custom funnel requests
- `leads` - Lead management
- `categories` - Auction categories
- `tags` - Auction tags
- `auction_tags` - Many-to-many relationship

## Step 3: Populate with Sample Data

1. In the SQL Editor, copy and paste the contents of `seed-data.sql`
2. **Important**: Before running, you need to have at least one user profile
3. If you don't have profiles yet, create one by:
   - Signing up through your app (this will create a profile automatically)
   - Or manually inserting a profile record

4. Click "Run" to populate the database with sample data

## Step 4: Test the Integration

The application should now be using real database operations instead of mock data. Test the following:

1. **Auctions**: Browse auctions page - should show real data from database
2. **Bidding**: Try placing bids on active auctions
3. **Authentication**: Sign up/login should create/update profiles
4. **Admin Dashboard**: Should show real statistics from database

## Database Features

### Row Level Security (RLS)
- Users can only see their own data
- Admins can see all data
- Public auctions are visible to everyone
- Bids are only visible for active auctions

### Automatic Updates
- `updated_at` timestamps are automatically maintained
- Auction status updates automatically based on time
- Bid placement automatically updates auction current price

### Data Integrity
- Foreign key constraints ensure data consistency
- Check constraints validate prices and dates
- Enum types ensure valid status values

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Make sure you ran the schema file first
   - Check that all tables were created successfully

2. **Permission denied errors**
   - Verify RLS policies are in place
   - Check that user authentication is working
   - Ensure user has proper role in profiles table

3. **Foreign key constraint errors**
   - Make sure referenced records exist
   - Check that IDs match between tables

4. **Empty results**
   - Verify seed data was inserted
   - Check that user authentication is working
   - Verify RLS policies allow the current user to see data

### Debugging

1. **Check Supabase logs** in the dashboard
2. **Verify RLS policies** are working correctly
3. **Test queries directly** in the SQL Editor
4. **Check browser console** for JavaScript errors

## Performance Considerations

- Indexes are created on frequently queried columns
- RLS policies are optimized for common access patterns
- Consider adding more indexes based on your query patterns

## Security Features

- All tables have RLS enabled
- Users can only access their own data
- Admins have broader access through role-based policies
- No direct table access without proper authentication

## Next Steps

1. **Customize the schema** if you need additional fields
2. **Add more seed data** for testing different scenarios
3. **Implement real-time features** using Supabase subscriptions
4. **Add database backups** and monitoring
5. **Optimize queries** based on usage patterns

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the RLS policies
3. Verify your authentication setup
4. Check the browser console for errors

The database is now fully integrated and ready for production use!
