// Core entity types for the Adalore Offer Engine

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
  advertiserName: string;  // Denormalized for convenience
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  offerUrl: string;

  // Matching & Ranking Metrics
  commissionRate: number;   // e.g., 0.05 for 5%
  conversionRate: number;   // e.g., 0.03 for 3%
  avgOrderValue: number;    // e.g., 85.00

  // Category for matching
  category: string;

  // Status
  isActive: boolean;

  // Daily stats for fair rotation
  impressionsToday: number;
}

export interface Impression {
  id: string;
  offerId: string;
  merchantId: string;
  advertiserId: string;
  sessionId: string;
  orderId?: string;
  orderValue?: number;
  createdAt: Date;
}

export interface Click {
  id: string;
  impressionId: string;
  offerId: string;
  merchantId: string;
  advertiserId: string;
  clickedAt: Date;
  redirectUrl?: string;
}

export interface Sale {
  id: string;
  clickId?: string;
  impressionId?: string;
  offerId: string;
  merchantId: string;
  advertiserId: string;
  externalOrderId?: string;
  saleAmount: number;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'paid';
  createdAt: Date;
}

// API Request/Response types

export interface GetOfferRequest {
  merchantId: string;
  orderValue?: number;
}

export interface GetOfferResponse {
  offerId: string;
  advertiser: string;
  score: number;  // EVI score
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
}

// Tracking event types

export interface TrackImpressionRequest {
  offerId: string;
  merchantId: string;
  sessionId: string;
  orderId?: string;
  orderValue?: number;
}

export interface TrackClickRequest {
  impressionId: string;
  offerId: string;
  merchantId: string;
}

export interface TrackSaleRequest {
  offerId: string;
  merchantId: string;
  externalOrderId: string;
  saleAmount: number;
  currency?: string;
}
