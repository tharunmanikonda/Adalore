# Adalore Data Schema

## Overview

This schema supports a post-purchase offer matching engine for Shopify Thank-You pages. The design prioritizes:

1. **Fast offer matching** - Sub-millisecond queries for real-time offer selection
2. **Accurate tracking** - Impression → Click → Sale attribution without double-counting
3. **Fair rotation** - Daily impression counts enable balanced offer distribution
4. **Commission accuracy** - Locked rates at sale time prevent disputes

## Why This Structure?

I chose a **normalized relational design** with strategic denormalization for these reasons:

- **Separation of concerns**: Merchants (hosts), Advertisers (brands), and Offers are distinct entities with clear relationships. This reflects the real-world business model where the same advertiser might have multiple offers, and merchants are independent from advertisers.

- **Denormalized IDs in tracking tables**: `impressions`, `clicks`, and `sales` include `advertiser_id` even though it's derivable from `offer_id`. This avoids JOINs in high-frequency reporting queries.

- **Daily stats aggregation**: Rather than counting impressions in real-time (expensive), we maintain a `daily_offer_stats` table updated incrementally. This makes the "fair rotation" tie-breaker query O(1) instead of a full table scan.

- **Immutable commission rates**: The `sales` table stores `commission_rate` at sale time. If an advertiser later changes their rate, historical sales remain accurate for payouts.

## Key Indexes

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `idx_offers_active_category` | Matching engine | Find active offers by category |
| `idx_offers_ranking` | EVI calculation | Sort by commission × conversion × AOV |
| `idx_daily_stats_lookup` | Fair rotation | Get today's impression count per offer |
| `idx_impressions_session` | Deduplication | Check if session already saw this offer |
| `idx_sales_status` | Payout processing | Find pending sales to confirm |

### Most Common Queries

```sql
-- 1. Get eligible offers for a merchant (matching engine)
SELECT o.*, a.name as advertiser_name, a.category
FROM offers o
JOIN advertisers a ON o.advertiser_id = a.id
WHERE a.category = $merchant_category
  AND a.id != $merchant_advertiser_id  -- Exclude own offers
  AND o.is_active = true;

-- 2. Get today's impressions for tie-breaking
SELECT impression_count
FROM daily_offer_stats
WHERE offer_id = $offer_id AND stat_date = CURRENT_DATE;

-- 3. Record an impression (with deduplication)
INSERT INTO impressions (offer_id, merchant_id, session_id, order_id, order_value, advertiser_id)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (offer_id, session_id) DO NOTHING;

-- 4. Attribution lookup (find click for a sale)
SELECT * FROM clicks
WHERE offer_id = $offer_id
  AND attribution_expires_at > NOW()
ORDER BY clicked_at DESC
LIMIT 1;
```

## Schema Evolution: Adding Budget Caps (v2)

The schema is already prepared for daily budget caps with minimal changes:

### Current Schema Already Has:
- `offers.daily_budget` - Maximum daily spend (NULL = unlimited)
- `offers.total_budget` - Lifetime budget cap
- `daily_offer_stats.spend` - Daily spend tracking

### Migration Steps (Zero Downtime):

**Step 1: Add helper function** (backward compatible)
```sql
CREATE FUNCTION is_offer_within_budget(offer_id UUID) RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT o.daily_budget IS NULL OR dos.spend < o.daily_budget
     FROM offers o
     LEFT JOIN daily_offer_stats dos ON dos.offer_id = o.id
       AND dos.stat_date = CURRENT_DATE
     WHERE o.id = $1),
    true
  );
$$ LANGUAGE SQL STABLE;
```

**Step 2: Update matching query** (application change)
```sql
-- Add to WHERE clause:
AND is_offer_within_budget(o.id)
```

**Step 3: Update spend tracking** (trigger)
```sql
CREATE TRIGGER update_daily_spend
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION increment_daily_spend();
```

This approach:
- Requires no table alterations (columns already exist)
- Uses a function for budget checks (easily testable)
- Can be rolled out gradually with feature flags
- Has zero downtime since it's additive

## Entity Relationships

```
┌─────────────┐       ┌─────────────┐
│  Merchants  │       │ Advertisers │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │                     │
       │              ┌──────┴──────┐
       │              │   Offers    │
       │              └──────┬──────┘
       │                     │
       └────────┬────────────┘
                │
         ┌──────┴──────┐
         │ Impressions │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │   Clicks    │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │   Sales     │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │  Payouts    │
         └─────────────┘
```
