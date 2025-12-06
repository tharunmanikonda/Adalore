-- Adalore Offer Engine - Complete Database Schema
-- Run this in Supabase SQL Editor for a fresh setup
-- Last Updated: 2025-12-06

-- =============================================================================
-- CLEANUP: Drop existing tables if they exist (for fresh start)
-- =============================================================================
DROP FUNCTION IF EXISTS recalculate_offer_metrics(UUID) CASCADE;
DROP FUNCTION IF EXISTS record_impression(UUID) CASCADE;
DROP FUNCTION IF EXISTS record_click(UUID) CASCADE;
DROP FUNCTION IF EXISTS record_sale(UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS reset_daily_impressions() CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS advertisers CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- =============================================================================
-- MERCHANTS TABLE
-- Merchants are the "hosts" - Shopify stores that show offers on their Thank-You pages
-- =============================================================================
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ADVERTISERS TABLE
-- Advertisers are the "brands" that want to show offers to customers
-- =============================================================================
CREATE TABLE advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    logo_url VARCHAR(512),
    website_url VARCHAR(512),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- OFFERS TABLE
-- Offers are the actual discounts/promotions that advertisers want to show
-- Includes full tracking metrics for CTR, conversion rate, etc.
-- =============================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,  -- 'percentage', 'fixed_amount', 'free_shipping'
    discount_value DECIMAL(10, 2) NOT NULL,
    offer_url VARCHAR(512) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,

    -- Business Setting (set by advertiser)
    commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.05,  -- e.g., 0.05 = 5%

    -- Tracking Counters (updated on each event)
    total_impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    impressions_today INTEGER DEFAULT 0,

    -- Calculated Metrics (derived from counters, recalculated on update)
    click_through_rate DECIMAL(7, 6) DEFAULT 0,   -- clicks / impressions (CTR)
    conversion_rate DECIMAL(7, 6) DEFAULT 0,      -- sales / impressions
    avg_order_value DECIMAL(10, 2) DEFAULT 0,     -- revenue / sales (AOV)

    -- Skip tracking
    total_skips INTEGER DEFAULT 0,
    skip_rate DECIMAL(7, 6) DEFAULT 0,            -- skips / impressions

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES for better query performance
-- =============================================================================
CREATE INDEX idx_merchants_category ON merchants(category) WHERE is_active = true;
CREATE INDEX idx_advertisers_category ON advertisers(category) WHERE is_active = true;
CREATE INDEX idx_offers_category ON offers(category) WHERE is_active = true;
CREATE INDEX idx_offers_advertiser ON offers(advertiser_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policies for public access (for demo purposes - restrict in production)
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

-- =============================================================================
-- FUNCTIONS for tracking and metrics
-- =============================================================================

-- Recalculate all derived metrics for an offer
CREATE OR REPLACE FUNCTION recalculate_offer_metrics(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        click_through_rate = CASE
            WHEN total_impressions > 0 THEN total_clicks::decimal / total_impressions
            ELSE 0
        END,
        conversion_rate = CASE
            WHEN total_impressions > 0 THEN total_sales::decimal / total_impressions
            ELSE 0
        END,
        avg_order_value = CASE
            WHEN total_sales > 0 THEN total_revenue / total_sales
            ELSE 0
        END,
        skip_rate = CASE
            WHEN total_impressions > 0 THEN total_skips::decimal / total_impressions
            ELSE 0
        END,
        updated_at = NOW()
    WHERE id = offer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Record an impression (offer was shown to a customer)
CREATE OR REPLACE FUNCTION record_impression(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_impressions = total_impressions + 1,
        impressions_today = impressions_today + 1
    WHERE id = offer_uuid;

    PERFORM recalculate_offer_metrics(offer_uuid);
END;
$$ LANGUAGE plpgsql;

-- Record a click (customer clicked on the offer)
CREATE OR REPLACE FUNCTION record_click(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_clicks = total_clicks + 1
    WHERE id = offer_uuid;

    PERFORM recalculate_offer_metrics(offer_uuid);
END;
$$ LANGUAGE plpgsql;

-- Record a sale (customer completed a purchase through the offer)
CREATE OR REPLACE FUNCTION record_sale(offer_uuid UUID, sale_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_sales = total_sales + 1,
        total_revenue = total_revenue + sale_amount
    WHERE id = offer_uuid;

    PERFORM recalculate_offer_metrics(offer_uuid);
END;
$$ LANGUAGE plpgsql;

-- Record a skip (user clicked skip on the offer)
CREATE OR REPLACE FUNCTION record_skip(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_skips = total_skips + 1
    WHERE id = offer_uuid;

    PERFORM recalculate_offer_metrics(offer_uuid);
END;
$$ LANGUAGE plpgsql;

-- Reset daily impressions (run at midnight via cron job)
CREATE OR REPLACE FUNCTION reset_daily_impressions()
RETURNS void AS $$
BEGIN
    UPDATE offers SET impressions_today = 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA: Merchants
-- =============================================================================
INSERT INTO merchants (name, category, domain, is_active) VALUES
    ('SportyGear', 'fitness', 'sportygear.com', true),
    ('GlowBeauty', 'beauty', 'glowbeauty.com', true),
    ('TechZone', 'electronics', 'techzone.com', true),
    ('YogaLife', 'fitness', 'yogalife.com', true);

-- =============================================================================
-- SAMPLE DATA: Advertisers
-- =============================================================================
INSERT INTO advertisers (name, category, logo_url, website_url, is_active) VALUES
    ('FitPro Supplements', 'fitness', 'https://placehold.co/100x100/10B981/white?text=FitPro', 'https://fitpro.example.com', true),
    ('RunFast Shoes', 'fitness', 'https://placehold.co/100x100/3B82F6/white?text=RunFast', 'https://runfast.example.com', true),
    ('LuxeSkin', 'beauty', 'https://placehold.co/100x100/EC4899/white?text=LuxeSkin', 'https://luxeskin.example.com', true),
    ('GadgetWorld', 'electronics', 'https://placehold.co/100x100/8B5CF6/white?text=Gadget', 'https://gadgetworld.example.com', true),
    ('ZenYoga Mats', 'fitness', 'https://placehold.co/100x100/F59E0B/white?text=ZenYoga', 'https://zenyoga.example.com', true),
    ('PowerLift Gear', 'fitness', 'https://placehold.co/100x100/EF4444/white?text=PowerLift', 'https://powerlift.example.com', true),
    ('GlowUp Cosmetics', 'beauty', 'https://placehold.co/100x100/F472B6/white?text=GlowUp', 'https://glowup.example.com', true),
    ('BeautyBox', 'beauty', 'https://placehold.co/100x100/A855F7/white?text=BeautyBox', 'https://beautybox.example.com', true);

-- =============================================================================
-- SAMPLE DATA: Offers with simulated tracking data
-- =============================================================================

-- FitPro - Good CTR (12%), moderate conversion (4.5%)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '20% Off Protein Powder', 'Premium whey protein for your fitness goals', 'percentage', 20, 'https://fitpro.example.com/offer/20off', 'fitness', 0.08, 1000, 120, 45, 3375, 150
FROM advertisers WHERE name = 'FitPro Supplements';

-- RunFast - Lower CTR (6.7%), but high AOV ($120)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '$30 Off Running Shoes', 'Professional running shoes for every terrain', 'fixed_amount', 30, 'https://runfast.example.com/offer/30off', 'fitness', 0.06, 1200, 80, 35, 4200, 200
FROM advertisers WHERE name = 'RunFast Shoes';

-- ZenYoga - Excellent CTR (18.75%), good conversion (6.9%)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, 'Free Shipping on Yoga Mats', 'Eco-friendly yoga mats with free delivery', 'free_shipping', 0, 'https://zenyoga.example.com/offer/freeship', 'fitness', 0.10, 800, 150, 55, 3575, 80
FROM advertisers WHERE name = 'ZenYoga Mats';

-- PowerLift - Moderate CTR (10%), highest AOV ($200)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '15% Off Weight Sets', 'Professional weight lifting equipment', 'percentage', 15, 'https://powerlift.example.com/offer/15off', 'fitness', 0.07, 600, 60, 20, 4000, 120
FROM advertisers WHERE name = 'PowerLift Gear';

-- LuxeSkin - Good CTR (15%), good conversion (6.7%)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '25% Off Skincare Bundle', 'Complete skincare routine at a discount', 'percentage', 25, 'https://luxeskin.example.com/offer/25off', 'beauty', 0.12, 900, 135, 60, 5700, 90
FROM advertisers WHERE name = 'LuxeSkin';

-- GadgetWorld - Moderate CTR (8.2%), lower conversion, highest product AOV ($250)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '$50 Off Smart Watches', 'Latest smart watches with health tracking', 'fixed_amount', 50, 'https://gadgetworld.example.com/offer/50off', 'electronics', 0.05, 1100, 90, 25, 6250, 180
FROM advertisers WHERE name = 'GadgetWorld';

-- GlowUp - Best CTR (20%), lower conversion (5%), lowest AOV ($45)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, '30% Off Lipstick Collection', 'Premium lipsticks in trending colors', 'percentage', 30, 'https://glowup.example.com/offer/30off', 'beauty', 0.10, 700, 140, 35, 1575, 60
FROM advertisers WHERE name = 'GlowUp Cosmetics';

-- BeautyBox - Good CTR (20%), BEST conversion (14%), high commission (15%)
INSERT INTO offers (advertiser_id, title, description, discount_type, discount_value, offer_url, category, commission_rate, total_impressions, total_clicks, total_sales, total_revenue, impressions_today)
SELECT id, 'Free Beauty Box with $50+ Order', 'Curated beauty samples with your purchase', 'free_shipping', 0, 'https://beautybox.example.com/offer/freebox', 'beauty', 0.15, 500, 100, 70, 5600, 40
FROM advertisers WHERE name = 'BeautyBox';

-- =============================================================================
-- RECALCULATE ALL METRICS after inserting sample data
-- =============================================================================
DO $$
DECLARE
    offer_record RECORD;
BEGIN
    FOR offer_record IN SELECT id FROM offers LOOP
        PERFORM recalculate_offer_metrics(offer_record.id);
    END LOOP;
END $$;

-- =============================================================================
-- VERIFY SETUP: Show all offers with their calculated metrics
-- =============================================================================
SELECT
    o.title,
    a.name as advertiser,
    o.category,
    o.commission_rate,
    o.total_impressions,
    o.total_clicks,
    o.total_sales,
    ROUND(o.click_through_rate * 100, 2) as ctr_percent,
    ROUND(o.conversion_rate * 100, 2) as conv_percent,
    ROUND(o.avg_order_value, 2) as aov,
    -- EVI = commission_rate * conversion_rate * avg_order_value
    ROUND(o.commission_rate * o.conversion_rate * o.avg_order_value, 4) as evi
FROM offers o
JOIN advertisers a ON o.advertiser_id = a.id
ORDER BY (o.commission_rate * o.conversion_rate * o.avg_order_value) DESC;
