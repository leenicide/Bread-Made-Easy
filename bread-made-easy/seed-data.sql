-- Seed data for Bread Made Easy database
-- This file populates the database with sample data for testing

-- Insert sample auctions (assuming you have some user profiles already)
-- Note: You'll need to replace the seller_id values with actual user IDs from your profiles table

-- Sample auction 1: E-commerce Funnel
INSERT INTO auctions (
    title,
    description,
    starting_price,
    current_price,
    buy_now_price,
    start_time,
    end_time,
    status,
    seller_id,
    image_url,
    category_id
) VALUES (
    'High-Converting E-commerce Funnel',
    'Complete sales funnel with cart abandonment sequences, upsells, and email automation. Proven 15% conversion rate across multiple industries. Includes landing pages, checkout flow, thank you pages, and automated email sequences.',
    500.00,
    500.00,
    1200.00,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '2 days',
    'active',
    (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
    '/ecommerce-funnel-dashboard.png',
    (SELECT id FROM categories WHERE name = 'E-commerce')
);

-- Sample auction 2: SaaS Lead Generation
INSERT INTO auctions (
    title,
    description,
    starting_price,
    current_price,
    buy_now_price,
    start_time,
    end_time,
    status,
    seller_id,
    image_url,
    category_id
) VALUES (
    'SaaS Lead Generation System',
    'Multi-step lead magnet funnel with webinar integration and automated follow-up sequences. 25% lead-to-trial conversion rate. Perfect for B2B SaaS companies looking to scale their lead generation.',
    800.00,
    800.00,
    1800.00,
    NOW() - INTERVAL '12 hours',
    NOW() + INTERVAL '5 hours',
    'active',
    (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
    '/saas-lead-generation-funnel.png',
    (SELECT id FROM categories WHERE name = 'SaaS')
);

-- Sample auction 3: Course Launch Funnel
INSERT INTO auctions (
    title,
    description,
    starting_price,
    current_price,
    buy_now_price,
    start_time,
    end_time,
    status,
    seller_id,
    image_url,
    category_id
) VALUES (
    'Course Launch Funnel Template',
    'Complete course launch sequence with early bird pricing, social proof integration, and payment plans. Used to launch 50+ successful online courses with average revenue of $100k+.',
    400.00,
    400.00,
    900.00,
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '1 day',
    'active',
    (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
    '/online-course-funnel.png',
    (SELECT id FROM categories WHERE name = 'Education')
);

-- Sample auction 4: Real Estate Funnel
INSERT INTO auctions (
    title,
    description,
    starting_price,
    current_price,
    buy_now_price,
    start_time,
    end_time,
    status,
    seller_id,
    image_url,
    category_id
) VALUES (
    'Real Estate Lead Generation Funnel',
    'Complete real estate lead generation system with property search, lead capture forms, and automated follow-up sequences. Proven to generate 50+ qualified leads per month.',
    600.00,
    600.00,
    1400.00,
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '3 days',
    'upcoming',
    (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
    '/real-estate-funnel.png',
    (SELECT id FROM categories WHERE name = 'Real Estate')
);

-- Sample auction 5: Fitness Coaching Funnel
INSERT INTO auctions (
    title,
    description,
    starting_price,
    current_price,
    buy_now_price,
    start_time,
    end_time,
    status,
    seller_id,
    image_url,
    category_id
) VALUES (
    'Fitness Coaching Membership Funnel',
    'Complete fitness coaching funnel with workout plans, meal tracking, progress monitoring, and membership upsells. Used by 100+ fitness coaches to scale their businesses.',
    700.00,
    700.00,
    1600.00,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 hour',
    'ended',
    (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
    '/fitness-coaching-funnel.png',
    (SELECT id FROM categories WHERE name = 'Fitness')
);

-- Link tags to auctions
-- E-commerce funnel tags
INSERT INTO auction_tags (auction_id, tag_id) VALUES
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%'), (SELECT id FROM tags WHERE name = 'ecommerce')),
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%'), (SELECT id FROM tags WHERE name = 'conversion')),
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%'), (SELECT id FROM tags WHERE name = 'automation')),
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%'), (SELECT id FROM tags WHERE name = 'email-marketing'));

-- SaaS funnel tags
INSERT INTO auction_tags (auction_id, tag_id) VALUES
    ((SELECT id FROM auctions WHERE title LIKE '%SaaS%'), (SELECT id FROM tags WHERE name = 'saas')),
    ((SELECT id FROM auctions WHERE title LIKE '%SaaS%'), (SELECT id FROM tags WHERE name = 'lead-generation')),
    ((SELECT id FROM auctions WHERE title LIKE '%SaaS%'), (SELECT id FROM tags WHERE name = 'webinar')),
    ((SELECT id FROM auctions WHERE title LIKE '%SaaS%'), (SELECT id FROM tags WHERE name = 'b2b'));

-- Course launch tags
INSERT INTO auction_tags (auction_id, tag_id) VALUES
    ((SELECT id FROM auctions WHERE title LIKE '%Course%'), (SELECT id FROM tags WHERE name = 'course')),
    ((SELECT id FROM auctions WHERE title LIKE '%Course%'), (SELECT id FROM tags WHERE name = 'education')),
    ((SELECT id FROM auctions WHERE title LIKE '%Course%'), (SELECT id FROM tags WHERE name = 'launch')),
    ((SELECT id FROM auctions WHERE title LIKE '%Course%'), (SELECT id FROM tags WHERE name = 'social-proof'));

-- Sample bids (only for active auctions)
INSERT INTO bids (auction_id, bidder_id, amount, is_winning) VALUES
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%' AND status = 'active'), (SELECT id FROM profiles LIMIT 1), 850.00, true),
    ((SELECT id FROM auctions WHERE title LIKE '%E-commerce%' AND status = 'active'), (SELECT id FROM profiles LIMIT 1), 800.00, false),
    ((SELECT id FROM auctions WHERE title LIKE '%SaaS%' AND status = 'active'), (SELECT id FROM profiles LIMIT 1), 1200.00, true),
    ((SELECT id FROM auctions WHERE title LIKE '%Course%' AND status = 'active'), (SELECT id FROM profiles LIMIT 1), 650.00, true);

-- Sample custom requests
INSERT INTO custom_requests (buyer_id, title, description, budget, deadline, status) VALUES
    ((SELECT id FROM profiles LIMIT 1), 'E-commerce Funnel for Fashion Brand', 'Need a complete e-commerce funnel with product catalog, cart, and checkout for a fashion brand.', 2500.00, NOW() + INTERVAL '14 days', 'open'),
    ((SELECT id FROM profiles LIMIT 1), 'SaaS Onboarding Flow', 'Multi-step onboarding funnel for B2B SaaS with trial signup and feature introduction.', 1800.00, NULL, 'in_progress');

-- Sample leads
INSERT INTO leads (email, name, source, status, notes) VALUES
    ('john@example.com', 'John Smith', 'auction', 'new', 'Interested in e-commerce funnels'),
    ('sarah@startup.com', 'Sarah Johnson', 'custom_request', 'qualified', 'Looking for SaaS lead generation system'),
    ('mike@realestate.com', 'Mike Wilson', 'direct_sale', 'contacted', 'Interested in real estate funnel'),
    ('lisa@fitness.com', 'Lisa Brown', 'newsletter', 'converted', 'Purchased fitness coaching funnel');

-- Sample purchases (completed transactions)
INSERT INTO purchases (buyer_id, auction_id, type, amount, status, stripe_payment_intent_id) VALUES
    ((SELECT id FROM profiles LIMIT 1), (SELECT id FROM auctions WHERE title LIKE '%Fitness%'), 'auction_win', 700.00, 'completed', 'pi_fitness_123'),
    ((SELECT id FROM profiles LIMIT 1), (SELECT id FROM auctions WHERE title LIKE '%E-commerce%'), 'buy_now', 1200.00, 'completed', 'pi_ecommerce_456');
