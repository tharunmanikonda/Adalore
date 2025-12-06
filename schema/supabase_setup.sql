-- Simplified schema for Adalore Demo
-- Run this in Supabase SQL Editor

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    logo_url VARCHAR(512),
    website_url VARCHAR(512),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    offer_url VARCHAR(512) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    conversion_rate DECIMAL(5, 4) NOT NULL,
    avg_order_value DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    impressions_today INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_advertisers_category ON advertisers(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_advertiser ON offers(advertiser_id);

-- Enable Row Level Security (RLS)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read merchants" ON merchants FOR SELECT USING (true);
CREATE POLICY "Allow public insert merchants" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update merchants" ON merchants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete merchants" ON merchants FOR DELETE USING (true);

CREATE POLICY "Allow public read advertisers" ON advertisers FOR SELECT USING (true);
CREATE POLICY "Allow public insert advertisers" ON advertisers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update advertisers" ON advertisers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete advertisers" ON advertisers FOR DELETE USING (true);

CREATE POLICY "Allow public read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Allow public insert offers" ON offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update offers" ON offers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete offers" ON offers FOR DELETE USING (true);

-- Insert sample data
INSERT INTO merchants (name, category, domain, is_active) VALUES
    ('SportyGear', 'fitness', 'sportygear.com', true),
    ('GlowBeauty', 'beauty', 'glowbeauty.com', true),
    ('TechZone', 'electronics', 'techzone.com', true),
    ('YogaLife', 'fitness', 'yogalife.com', true);

INSERT INTO advertisers (name, category, logo_url, website_url, is_active) VALUES
    ('FitPro Supplements', 'fitness', 'https://placehold.co/100x100/10B981/white?text=FitPro', 'https://fitpro.example.com', true),
    ('RunFast Shoes', 'fitness', 'https://placehold.co/100x100/3B82F6/white?text=RunFast', 'https://runfast.example.com', true),
    ('LuxeSkin', 'beauty', 'https://placehold.co/100x100/EC4899/white?text=LuxeSkin', 'https://luxeskin.example.com', true),
    ('GadgetWorld', 'electronics', 'https://placehold.co/100x100/8B5CF6/white?text=Gadget', 'https://gadgetworld.example.com', true),
    ('ZenYoga Mats', 'fitness', 'https://placehold.co/100x100/F59E0B/white?text=ZenYoga', 'https://zenyoga.example.com', true),
    ('PowerLift Gear', 'fitness', 'https://placehold.co/100x100/EF4444/white?text=PowerLift', 'https://powerlift.example.com', true),
    ('GlowUp Cosmetics', 'beauty', 'https://placehold.co/100x100/F472B6/white?text=GlowUp', 'https://glowup.example.com', true),
    ('BeautyBox', 'beauty', 'https://placehold.co/100x100/A855F7/white?text=BeautyBox', 'https://beautybox.example.com', true);

-- Insert offers (need to get advertiser IDs first)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '20% Off Protein Powder',
    'Premium whey protein for your fitness goals',
    'percentage',
    20,
    'https://fitpro.example.com/offer/20off',
    0.08,
    0.045,
    75,
    'fitness',
    true,
    150
FROM advertisers WHERE name = 'FitPro Supplements';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '$30 Off Running Shoes',
    'Professional running shoes for every terrain',
    'fixed_amount',
    30,
    'https://runfast.example.com/offer/30off',
    0.06,
    0.035,
    120,
    'fitness',
    true,
    200
FROM advertisers WHERE name = 'RunFast Shoes';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    'Free Shipping on Yoga Mats',
    'Eco-friendly yoga mats with free delivery',
    'free_shipping',
    0,
    'https://zenyoga.example.com/offer/freeship',
    0.10,
    0.055,
    65,
    'fitness',
    true,
    80
FROM advertisers WHERE name = 'ZenYoga Mats';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '15% Off Weight Sets',
    'Professional weight lifting equipment',
    'percentage',
    15,
    'https://powerlift.example.com/offer/15off',
    0.07,
    0.040,
    200,
    'fitness',
    true,
    120
FROM advertisers WHERE name = 'PowerLift Gear';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '25% Off Skincare Bundle',
    'Complete skincare routine at a discount',
    'percentage',
    25,
    'https://luxeskin.example.com/offer/25off',
    0.12,
    0.060,
    95,
    'beauty',
    true,
    90
FROM advertisers WHERE name = 'LuxeSkin';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '$50 Off Smart Watches',
    'Latest smart watches with health tracking',
    'fixed_amount',
    50,
    'https://gadgetworld.example.com/offer/50off',
    0.05,
    0.025,
    250,
    'electronics',
    true,
    180
FROM advertisers WHERE name = 'GadgetWorld';

-- Additional beauty offers
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    '30% Off Lipstick Collection',
    'Premium lipsticks in trending colors',
    'percentage',
    30,
    'https://glowup.example.com/offer/30off',
    0.10,
    0.055,
    45,
    'beauty',
    true,
    60
FROM advertisers WHERE name = 'GlowUp Cosmetics';

INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, commission_rate, conversion_rate, avg_order_value, category, is_active, impressions_today)
SELECT
    id,
    'Free Beauty Box with $50+ Order',
    'Curated beauty samples with your purchase',
    'free_shipping',
    0,
    'https://beautybox.example.com/offer/freebox',
    0.15,
    0.070,
    80,
    'beauty',
    true,
    40
FROM advertisers WHERE name = 'BeautyBox';
