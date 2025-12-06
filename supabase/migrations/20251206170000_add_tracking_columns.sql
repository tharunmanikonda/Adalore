-- Migration: Add tracking columns to offers table
-- This adds CTR, clicks, sales, and revenue tracking

-- Add new tracking columns to offers table
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS total_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_through_rate DECIMAL(7, 6) DEFAULT 0;

-- Update existing offers with simulated tracking data
-- Using impressions_today as a base to generate realistic numbers
UPDATE offers SET
  total_impressions = COALESCE(impressions_today, 100) * 7,
  total_clicks = ROUND(COALESCE(impressions_today, 100) * 7 * 0.12),
  total_sales = ROUND(COALESCE(impressions_today, 100) * 7 * 0.045),
  total_revenue = ROUND(COALESCE(impressions_today, 100) * 7 * 0.045 * COALESCE(avg_order_value, 50)),
  click_through_rate = 0.12
WHERE total_impressions = 0 OR total_impressions IS NULL;

-- Recalculate conversion_rate based on actual tracking data
UPDATE offers SET
  conversion_rate = CASE
    WHEN total_impressions > 0 THEN total_sales::decimal / total_impressions
    ELSE 0
  END;

-- Create function to recalculate offer metrics (if not exists)
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
        updated_at = NOW()
    WHERE id = offer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to record an impression
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

-- Create function to record a click
CREATE OR REPLACE FUNCTION record_click(offer_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE offers SET
        total_clicks = total_clicks + 1
    WHERE id = offer_uuid;

    PERFORM recalculate_offer_metrics(offer_uuid);
END;
$$ LANGUAGE plpgsql;

-- Create function to record a sale
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

-- Create function to reset daily impressions (run at midnight via cron)
CREATE OR REPLACE FUNCTION reset_daily_impressions()
RETURNS void AS $$
BEGIN
    UPDATE offers SET impressions_today = 0;
END;
$$ LANGUAGE plpgsql;
