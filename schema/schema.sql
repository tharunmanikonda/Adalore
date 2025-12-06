-- Adalore Post-Purchase Offer Engine Schema
-- PostgreSQL / Supabase Compatible

-- ============================================
-- MERCHANTS TABLE
-- Hosts who display offers on their Thank-You pages
-- ============================================
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,  -- e.g., 'fitness', 'beauty', 'electronics'
    shopify_store_id VARCHAR(255) UNIQUE,  -- Shopify store identifier
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADVERTISERS TABLE
-- Brands that create offers
-- ============================================
CREATE TABLE advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,  -- Must match merchant category for eligibility
    logo_url VARCHAR(512),
    website_url VARCHAR(512),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OFFERS TABLE
-- Promotional offers from advertisers
-- ============================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,  -- 'percentage', 'fixed_amount', 'free_shipping'
    discount_value DECIMAL(10, 2) NOT NULL,  -- e.g., 20 for 20% or 20.00 for $20
    offer_url VARCHAR(512) NOT NULL,

    -- Matching & Ranking Metrics
    commission_rate DECIMAL(5, 4) NOT NULL,  -- e.g., 0.0500 for 5%
    conversion_rate DECIMAL(5, 4) NOT NULL,  -- Historical conversion rate (0.0000 to 1.0000)
    avg_order_value DECIMAL(10, 2) NOT NULL, -- Average order value when this offer converts

    -- Status & Limits
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,

    -- Budget Tracking (v2 feature prep)
    daily_budget DECIMAL(10, 2),  -- NULL means unlimited
    total_budget DECIMAL(10, 2),  -- NULL means unlimited

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- IMPRESSIONS TABLE
-- Records when an offer is shown to a customer
-- ============================================
CREATE TABLE impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,  -- Browser session or unique visitor ID
    order_id VARCHAR(255),  -- Shopify order ID
    order_value DECIMAL(10, 2),

    -- Denormalized for query performance
    advertiser_id UUID NOT NULL REFERENCES advertisers(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate impressions per session
    UNIQUE(offer_id, session_id)
);

-- ============================================
-- CLICKS TABLE
-- Records when a customer clicks on an offer
-- ============================================
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    impression_id UUID NOT NULL REFERENCES impressions(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    advertiser_id UUID NOT NULL REFERENCES advertisers(id),

    -- Click metadata
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    redirect_url VARCHAR(512),  -- Final URL user was sent to

    -- Attribution window tracking
    attribution_expires_at TIMESTAMP WITH TIME ZONE  -- e.g., 30 days from click
);

-- ============================================
-- SALES TABLE
-- Records conversions attributed to offers
-- ============================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES clicks(id),  -- NULL if direct attribution
    impression_id UUID REFERENCES impressions(id),
    offer_id UUID NOT NULL REFERENCES offers(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),  -- Host merchant
    advertiser_id UUID NOT NULL REFERENCES advertisers(id),  -- Brand that made the sale

    -- Sale details
    external_order_id VARCHAR(255),  -- Advertiser's order ID
    sale_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Commission calculation
    commission_rate DECIMAL(5, 4) NOT NULL,  -- Locked at time of sale
    commission_amount DECIMAL(10, 2) NOT NULL,  -- Calculated: sale_amount * commission_rate

    -- Status
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'confirmed', 'rejected', 'paid'
    confirmed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent double-counting
    UNIQUE(external_order_id, advertiser_id)
);

-- ============================================
-- PAYOUTS TABLE
-- Commission payments to merchants
-- ============================================
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),

    -- Payout details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),  -- 'bank_transfer', 'paypal', etc.
    payment_reference VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYOUT_LINE_ITEMS TABLE
-- Individual sales included in a payout
-- ============================================
CREATE TABLE payout_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id),
    commission_amount DECIMAL(10, 2) NOT NULL,

    UNIQUE(payout_id, sale_id)
);

-- ============================================
-- DAILY OFFER STATS TABLE
-- Aggregated daily metrics for fair rotation
-- ============================================
CREATE TABLE daily_offer_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    impression_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    sale_count INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0,  -- For budget tracking

    UNIQUE(offer_id, stat_date)
);

-- ============================================
-- INDEXES
-- ============================================

-- Merchant lookups
CREATE INDEX idx_merchants_category ON merchants(category) WHERE is_active = true;
CREATE INDEX idx_merchants_shopify_id ON merchants(shopify_store_id);

-- Advertiser lookups
CREATE INDEX idx_advertisers_category ON advertisers(category) WHERE is_active = true;

-- Offer matching queries (most critical for performance)
CREATE INDEX idx_offers_advertiser ON offers(advertiser_id);
CREATE INDEX idx_offers_active_category ON offers(is_active, advertiser_id)
    WHERE is_active = true;
CREATE INDEX idx_offers_ranking ON offers(commission_rate, conversion_rate, avg_order_value)
    WHERE is_active = true;

-- Impression tracking
CREATE INDEX idx_impressions_offer_date ON impressions(offer_id, created_at);
CREATE INDEX idx_impressions_merchant ON impressions(merchant_id, created_at);
CREATE INDEX idx_impressions_session ON impressions(session_id);

-- Click tracking
CREATE INDEX idx_clicks_impression ON clicks(impression_id);
CREATE INDEX idx_clicks_attribution ON clicks(offer_id, attribution_expires_at);

-- Sales reporting
CREATE INDEX idx_sales_merchant ON sales(merchant_id, created_at);
CREATE INDEX idx_sales_advertiser ON sales(advertiser_id, created_at);
CREATE INDEX idx_sales_status ON sales(status) WHERE status = 'pending';

-- Daily stats for fair rotation
CREATE INDEX idx_daily_stats_lookup ON daily_offer_stats(offer_id, stat_date);

-- Payout queries
CREATE INDEX idx_payouts_merchant ON payouts(merchant_id, status);
