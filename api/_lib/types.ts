// Core entity types for the Adalore Offer Engine
// Shared between backend and frontend

export interface Merchant {
  id: string;
  name: string;
  category: string;
  shopifyStoreId?: string;
  domain?: string;
  isActive: boolean;
}

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
}

export interface Offer {
  id: string;
  advertiserId: string;
  advertiserName: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  offerUrl: string;
  commissionRate: number;
  totalImpressions: number;
  totalClicks: number;
  totalSales: number;
  totalRevenue: number;
  clickThroughRate: number;
  conversionRate: number;
  avgOrderValue: number;
  category: string;
  isActive: boolean;
  impressionsToday: number;
  totalSkips: number;
  skipRate: number;
}

// Database types (snake_case from Supabase)
export interface DbMerchant {
  id: string;
  name: string;
  category: string;
  domain: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbAdvertiser {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbOffer {
  id: string;
  advertiser_id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  offer_url: string;
  commission_rate: number;
  conversion_rate: number;
  avg_order_value: number;
  category: string;
  is_active: boolean;
  impressions_today: number;
  total_impressions: number;
  total_clicks: number;
  total_sales: number;
  total_revenue: number;
  click_through_rate: number;
  total_skips: number;
  skip_rate: number;
  created_at?: string;
  updated_at?: string;
  advertisers?: DbAdvertiser;
}

// API Request/Response types
export interface GetOfferResponse {
  offerId: string;
  advertiser: string;
  score: number;
  offer: {
    title: string;
    description?: string;
    discountType: string;
    discountValue: number;
    offerUrl: string;
    logoUrl?: string;
  };
  debug?: MatchingDebugInfo;
}

export interface MatchingDebugInfo {
  merchantCategory: string;
  eligibleOffersCount: number;
  selectedOfferId: string;
  selectionReason: string;
  allCandidates: CandidateOffer[];
}

export interface CandidateOffer {
  offerId: string;
  advertiserName: string;
  evi: number;
  impressionsToday: number;
  eligible: boolean;
  ineligibleReason?: string;
  totalImpressions?: number;
  totalClicks?: number;
  totalSales?: number;
  totalSkips?: number;
  clickThroughRate?: number;
  conversionRate?: number;
  skipRate?: number;
  commissionRate?: number;
  avgOrderValue?: number;
}

// Transform functions
export function dbToMerchant(db: DbMerchant): Merchant {
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    domain: db.domain || undefined,
    isActive: db.is_active,
  };
}

export function dbToOffer(db: DbOffer): Offer {
  return {
    id: db.id,
    advertiserId: db.advertiser_id,
    advertiserName: db.advertisers?.name || 'Unknown',
    title: db.title,
    description: db.description || undefined,
    discountType: db.discount_type as 'percentage' | 'fixed_amount' | 'free_shipping',
    discountValue: db.discount_value,
    offerUrl: db.offer_url,
    commissionRate: db.commission_rate,
    conversionRate: db.conversion_rate,
    avgOrderValue: db.avg_order_value,
    category: db.category,
    isActive: db.is_active,
    impressionsToday: db.impressions_today,
    totalImpressions: db.total_impressions || 0,
    totalClicks: db.total_clicks || 0,
    totalSales: db.total_sales || 0,
    totalRevenue: db.total_revenue || 0,
    clickThroughRate: db.click_through_rate || 0,
    totalSkips: db.total_skips || 0,
    skipRate: db.skip_rate || 0,
  };
}
