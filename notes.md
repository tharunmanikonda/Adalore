# Adalore Offer Engine - Design Notes

## Part 3: Tracking Logic

### Event Flow Architecture

The tracking system follows a standard impression → click → conversion funnel:

```
[Shopify Thank-You Page] → [Adalore JS SDK] → [Tracking API] → [Database]
                                   ↓
                            [Event Queue]
                                   ↓
                         [Background Workers]
```

**Impression Recording:**
When a merchant's Thank-You page loads and displays an offer, the embedded JavaScript SDK fires a `POST /api/track/impression` request containing: `offerId`, `merchantId`, `sessionId` (generated client-side), `orderId`, and `orderValue`. The API inserts into the `impressions` table with a unique constraint on `(offer_id, session_id)` to prevent duplicates if the user refreshes the page. We return an `impressionId` that the frontend stores for click attribution.

**Click Tracking:**
When a user clicks "Claim Offer", the SDK fires `POST /api/track/click` with the `impressionId`. The backend validates the impression exists, creates a click record, sets an `attribution_expires_at` timestamp (e.g., 30 days out), and then redirects the user to the advertiser's landing page via a 302 redirect. The redirect URL includes a tracking parameter (e.g., `?adalore_click=abc123`) that the advertiser's checkout can capture.

**Sale Attribution:**
When a sale occurs on the advertiser's site, their backend sends a webhook to `POST /api/track/sale` with the order details and the `adalore_click` parameter if present. We look up the click by ID, verify the attribution window hasn't expired, and create a sale record with commission calculated at the rate locked to the original offer. If no click ID is present (view-through), we attempt to match by `sessionId` from a recent impression within a shorter window (e.g., 24 hours).

**Double-Counting Prevention:**
1. **Impressions**: `UNIQUE(offer_id, session_id)` constraint with `ON CONFLICT DO NOTHING`
2. **Clicks**: Each click links to exactly one impression; we validate the impression exists
3. **Sales**: `UNIQUE(external_order_id, advertiser_id)` prevents the same order from being attributed twice, even if multiple webhooks arrive

### Handling Edge Cases

**Delayed Webhooks:** Shopify webhooks can arrive out of order or be delayed. We handle this by:
- Using idempotency keys (external_order_id) so retries are safe
- Processing webhooks asynchronously via a queue with at-least-once delivery
- Storing `created_at` timestamps from the webhook payload, not just receipt time
- Running a daily reconciliation job that pulls Shopify orders and cross-checks against our sales records

**Missing Click Data:** For view-through attribution:
- If we receive a sale webhook without a click ID, we query for recent impressions matching the user's session/email within the attribution window
- We prioritize: (1) click attribution, (2) impression attribution, (3) no attribution
- Sales without attribution are logged but don't generate commission to avoid disputes

---

## Part 4: Production Readiness

### "If this endpoint will serve 10M requests/day, what changes?"

At ~115 requests/second, the main bottleneck is the offer selection query. I would: (1) cache the eligible offers list per category in Redis with a 60-second TTL, (2) pre-compute and cache EVI scores since they only change when offer metrics update, (3) use connection pooling for database connections, and (4) serve the endpoint from edge locations via Vercel Edge Functions or Cloudflare Workers for sub-50ms latency globally.

### "How would you protect it against abuse?"

Three layers: (1) **Rate limiting** - 100 requests/minute per merchant API key using sliding window counters in Redis, (2) **Request validation** - verify the `merchantId` exists and is active before processing, reject malformed requests early, (3) **Anomaly detection** - flag merchants with unusual patterns (e.g., 10x normal traffic) for manual review and temporarily reduce their rate limit. For click fraud specifically, we'd implement fingerprinting to detect bot-like behavior and require CAPTCHAs for suspicious sessions.

### "How would you make the system debuggable for merchants?"

Build a merchant dashboard showing: (1) **Real-time event stream** - last 100 impressions/clicks/sales with timestamps, offer IDs, and attribution status, (2) **Matching explainer** - for any given request, show why each offer was selected or rejected (the debug info already in our API), (3) **Commission reconciliation** - detailed breakdown of pending/confirmed/paid commissions with links to the original events. Add structured logging with correlation IDs so our support team can trace any request end-to-end.

---

## Extra Credit: Design Evolution

### Supporting Future Rules Without Rewriting Core Logic

The matching engine is designed for extensibility. Here's how each new rule would be added:

**1. Brand Exclusions (Merchant → Advertiser blocklist)**

Add a `merchant_brand_exclusions` table:
```sql
CREATE TABLE merchant_brand_exclusions (
  merchant_id UUID REFERENCES merchants(id),
  advertiser_id UUID REFERENCES advertisers(id),
  PRIMARY KEY (merchant_id, advertiser_id)
);
```

In the matching engine, add an exclusion filter as the first eligibility check. This is O(1) with a pre-loaded Set per merchant.

**2. Daily Budget Caps**

The schema already has `offers.daily_budget` and `daily_offer_stats.spend`. Add a budget check to `isOfferEligible()`:
```typescript
if (offer.dailyBudget && dailyStats.spend >= offer.dailyBudget) {
  return { eligible: false, reason: 'Daily budget exhausted' };
}
```

Use Redis to track real-time spend and sync to the database periodically. When an offer exhausts its budget, it's automatically excluded until midnight UTC.

**3. A/B Testing Matching Strategies**

Implement a **Strategy Pattern**:
```typescript
interface MatchingStrategy {
  name: string;
  selectOffer(offers: Offer[], merchant: Merchant): Offer | null;
}

class EVIStrategy implements MatchingStrategy { ... }
class RandomStrategy implements MatchingStrategy { ... }
class NewOffersBoostStrategy implements MatchingStrategy { ... }
```

The main `selectNextOffer` function becomes:
```typescript
function selectNextOffer(offers, merchant, experimentId?) {
  const strategy = getStrategy(merchant, experimentId); // feature flag lookup
  return strategy.selectOffer(offers, merchant);
}
```

Use a feature flag service (LaunchDarkly, Statsig) to assign merchants to experiments. Track which strategy served each impression for analysis.

### Patterns Considered

- **Rules Engine**: For complex multi-condition rules, could use a rules engine like `json-rules-engine`. Overkill for now, but useful if rules become user-configurable.
- **Feature Flags**: Essential for gradual rollouts and A/B tests. Would use server-side evaluation with merchant ID as the key.
- **Configuration over Code**: Store exclusion lists, budget caps, and strategy assignments in the database rather than code. Allows changes without deployments.
- **Event Sourcing**: For audit trails and debugging, consider logging all state changes as events. Makes it easy to answer "why did this merchant see this offer?"
