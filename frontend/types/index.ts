// Re-export types from backend for frontend use
export type {
  Merchant,
  Advertiser,
  Offer,
  GetOfferResponse,
  MatchingDebugInfo,
  CandidateOffer,
} from '../../backend/types';

// Frontend-specific types
export interface TrackingEvent {
  type: 'impression' | 'click' | 'skip' | 'sale';
  offerId: string;
  timestamp: Date;
  amount?: number;
}
