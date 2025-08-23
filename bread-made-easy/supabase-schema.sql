-- Supabase Database Schema for Bread Made Easy
-- This schema replaces all mock data with real database tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('buyer', 'admin');
CREATE TYPE auction_status AS ENUM ('upcoming', 'active', 'ended', 'sold');
CREATE TYPE purchase_type AS ENUM ('auction_win', 'buy_now', 'direct_sale');
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE custom_request_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted');
CREATE TYPE lead_source AS ENUM ('auction', 'direct_sale', 'custom_request', 'newsletter');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'buyer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL CHECK (starting_price > 0),
    current_price DECIMAL(10,2) NOT NULL CHECK (current_price >= starting_price),
    buy_now_price DECIMAL(10,2) CHECK (buy_now_price > starting_price),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status auction_status DEFAULT 'upcoming',
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_auction_times CHECK (end_time > start_time),
    CONSTRAINT valid_prices CHECK (buy_now_price IS NULL OR buy_now_price > starting_price)
);

-- Auction tags junction table
CREATE TABLE IF NOT EXISTS auction_tags (
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (auction_id, tag_id)
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
    bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_winning BOOLEAN DEFAULT false,
    
    CONSTRAINT valid_bid_amount CHECK (amount > 0)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
    type purchase_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status purchase_status DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom requests table
CREATE TABLE IF NOT EXISTS custom_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL CHECK (budget > 0),
    deadline TIMESTAMP WITH TIME ZONE,
    status custom_request_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    source lead_source NOT NULL,
    status lead_status DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_category_id ON auctions(category_id);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_auction_id ON purchases(auction_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_buyer_id ON custom_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_requests_updated_at BEFORE UPDATE ON custom_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update auction status based on time
CREATE OR REPLACE FUNCTION update_auction_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to active if start time has passed
    IF NEW.start_time <= NOW() AND NEW.status = 'upcoming' THEN
        NEW.status = 'active';
    END IF;
    
    -- Update status to ended if end time has passed and no winner
    IF NEW.end_time <= NOW() AND NEW.status = 'active' AND NEW.winner_id IS NULL THEN
        NEW.status = 'ended';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auction status trigger
CREATE TRIGGER update_auction_status_trigger BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_auction_status();

-- Function to handle bid placement and update auction
CREATE OR REPLACE FUNCTION handle_bid_placement()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark all other bids for this auction as not winning
    UPDATE bids 
    SET is_winning = false 
    WHERE auction_id = NEW.auction_id AND id != NEW.id;
    
    -- Update auction current price
    UPDATE auctions 
    SET current_price = NEW.amount, updated_at = NOW()
    WHERE id = NEW.auction_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply bid placement trigger
CREATE TRIGGER handle_bid_placement_trigger AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION handle_bid_placement();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('E-commerce', 'E-commerce funnels and sales systems'),
    ('SaaS', 'Software as a Service funnels and onboarding'),
    ('Education', 'Course launches and educational funnels'),
    ('Real Estate', 'Real estate lead generation and sales'),
    ('Fitness', 'Fitness coaching and membership funnels'),
    ('Digital Products', 'Digital product launches and sales')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO tags (name) VALUES
    ('conversion', 'automation', 'email-marketing', 'ecommerce', 'lead-generation'),
    ('webinar', 'b2b', 'course', 'education', 'launch'),
    ('social-proof', 'fashion', 'onboarding', 'trial', 'membership')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Auctions policies
CREATE POLICY "Anyone can view active auctions" ON auctions
    FOR SELECT USING (status IN ('active', 'upcoming'));

CREATE POLICY "Users can view their own auctions" ON auctions
    FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Users can create auctions" ON auctions
    FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own auctions" ON auctions
    FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all auctions" ON auctions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bids policies
CREATE POLICY "Anyone can view bids for active auctions" ON bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auctions WHERE id = auction_id AND status = 'active'
        )
    );

CREATE POLICY "Users can view their own bids" ON bids
    FOR SELECT USING (bidder_id = auth.uid());

CREATE POLICY "Users can place bids" ON bids
    FOR INSERT WITH CHECK (bidder_id = auth.uid());

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON purchases
    FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can create purchases" ON purchases
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Admins can view all purchases" ON purchases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Custom requests policies
CREATE POLICY "Users can view their own requests" ON custom_requests
    FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can create requests" ON custom_requests
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own requests" ON custom_requests
    FOR UPDATE USING (buyer_id = auth.uid());

CREATE POLICY "Admins can manage all requests" ON custom_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Leads policies (admin only)
CREATE POLICY "Admins can manage leads" ON leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
