// Core entity types

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

// Frontend-specific types
export interface TrackingEvent {
  type: 'impression' | 'click' | 'skip' | 'sale';
  offerId: string;
  timestamp: Date;
  amount?: number;
}
