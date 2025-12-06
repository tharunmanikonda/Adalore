# Adalore Post-Purchase Offer Engine

A minimal backend and demo frontend for matching post-purchase offers on Shopify Thank-You pages.

## Live Demo

[View Demo](https://adalore.vercel.app) (Deploy to Vercel to see it live)

## Project Structure

```
/Adalore
├── /schema                    # Part 1: Data Model
│   ├── schema.sql            # PostgreSQL schema
│   └── README.md             # Schema documentation
├── /src                      # Part 2: Frontend + Matching Engine
│   ├── services/
│   │   └── matchingEngine.ts # Pure selectNextOffer() function
│   ├── components/           # React components
│   ├── data/
│   │   └── mockData.ts       # In-memory test data
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── /api                      # Vercel serverless functions
│   └── offer/
│       └── next.ts           # GET /api/offer/next endpoint
├── /tests
│   └── matchingEngine.test.ts # Unit tests (19 tests)
└── /notes.md                 # Part 3 & 4: Tracking logic + Production answers
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## API Endpoint

```
GET /api/offer/next?merchantId=merchant-1&orderValue=60&debug=true
```

### Response

```json
{
  "offerId": "offer-3",
  "advertiser": "ZenYoga Mats",
  "score": 0.3575,
  "offer": {
    "title": "Free Shipping on Yoga Mats",
    "description": "Eco-friendly yoga mats with free delivery",
    "discountType": "free_shipping",
    "discountValue": 0,
    "offerUrl": "https://zenyoga.example.com/offer/freeship"
  },
  "debug": {
    "merchantCategory": "fitness",
    "eligibleOffersCount": 5,
    "selectedOfferId": "offer-3",
    "selectionReason": "Highest EVI score",
    "allCandidates": [...]
  }
}
```

## Matching Logic

The `selectNextOffer()` function implements these rules:

1. **Category Matching** - Only offers in the same category as the merchant are eligible
2. **Self-Exclusion** - Merchants cannot see their own offers
3. **EVI Ranking** - `EVI = commission × conversionRate × avgOrderValue`
4. **Fair Rotation** - Ties broken by fewer impressions today

## Testing

```bash
npm run test:run
```

All 19 tests pass, covering:
- EVI calculation
- Eligibility rules
- Offer selection
- Tie-breaking logic
- Debug info generation

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Testing**: Vitest
- **Database**: Supabase (PostgreSQL) - schema ready

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/adalore)

1. Push to GitHub
2. Import project in Vercel
3. Deploy (auto-detected as Vite project)
