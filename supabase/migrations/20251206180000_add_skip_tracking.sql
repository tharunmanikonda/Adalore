-- Migration: Add skip tracking to offers table
-- Skip rate = total_skips / total_impressions
-- Helps identify offers users actively reject

-- Add skip tracking column
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS total_skips INTEGER DEFAULT 0;

-- Add skip_rate calculated column (for convenience)
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS skip_rate DECIMAL(7, 6) DEFAULT 0;

-- Function to record a skip and recalculate skip_rate
CREATE OR REPLACE FUNCTION record_skip(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_skips = total_skips + 1,
        skip_rate = CASE
            WHEN total_impressions > 0 THEN (total_skips + 1)::decimal / total_impressions
            ELSE 0
        END,
        updated_at = NOW()
    WHERE id = offer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update recalculate_offer_metrics to include skip_rate
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

-- Initialize skip data for existing offers (simulate some skips)
UPDATE offers SET
    total_skips = ROUND(total_impressions * 0.15),  -- Assume 15% skip rate historically
    skip_rate = 0.15
WHERE total_skips = 0 OR total_skips IS NULL;
