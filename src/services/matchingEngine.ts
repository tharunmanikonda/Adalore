import type { Offer, Merchant, GetOfferResponse, CandidateOffer, MatchingDebugInfo } from '../types';

/**
 * Calculate Expected Value Index (EVI) for an offer
 * EVI = commission * conversionRate * avgOrderValue
 */
export function calculateEVI(offer: Offer): number {
  return offer.commissionRate * offer.conversionRate * offer.avgOrderValue;
}

/**
 * Check if an offer is eligible for a merchant
 * Rules:
 * 1. Offer must be active
 * 2. Offer category must match merchant category
 * 3. Merchant cannot see their own offers (if they're also an advertiser)
 */
export function isOfferEligible(
  offer: Offer,
  merchant: Merchant,
  merchantAdvertiserId?: string
): { eligible: boolean; reason?: string } {
  // Rule 1: Offer must be active
  if (!offer.isActive) {
    return { eligible: false, reason: 'Offer is not active' };
  }

  // Rule 2: Category must match
  if (offer.category !== merchant.category) {
    return { eligible: false, reason: `Category mismatch: ${offer.category} vs ${merchant.category}` };
  }

  // Rule 3: Merchant cannot see own offers
  if (merchantAdvertiserId && offer.advertiserId === merchantAdvertiserId) {
    return { eligible: false, reason: 'Cannot show merchant their own offers' };
  }

  return { eligible: true };
}

/**
 * Select the next offer to show for a merchant
 *
 * Pure function that implements the matching logic:
 * 1. Filter to eligible offers (same category, not own offers, active)
 * 2. Calculate EVI for each eligible offer
 * 3. Select highest EVI
 * 4. Tie-breaker: fewer impressions today wins
 *
 * @param offers - All available offers
 * @param merchant - The merchant requesting an offer
 * @param merchantAdvertiserId - Optional: if merchant is also an advertiser, exclude their offers
 * @param includeDebug - Whether to include debug information
 */
export function selectNextOffer(
  offers: Offer[],
  merchant: Merchant,
  merchantAdvertiserId?: string,
  includeDebug: boolean = false
): GetOfferResponse | null {
  const candidates: CandidateOffer[] = [];
  const eligibleOffers: Array<Offer & { evi: number }> = [];

  // Evaluate all offers
  for (const offer of offers) {
    const eligibility = isOfferEligible(offer, merchant, merchantAdvertiserId);
    const evi = calculateEVI(offer);

    candidates.push({
      offerId: offer.id,
      advertiserName: offer.advertiserName,
      evi: Math.round(evi * 10000) / 10000, // Round to 4 decimal places
      impressionsToday: offer.impressionsToday,
      eligible: eligibility.eligible,
      ineligibleReason: eligibility.reason,
      // Include tracking metrics for debug display
      totalImpressions: offer.totalImpressions,
      totalClicks: offer.totalClicks,
      totalSales: offer.totalSales,
      totalSkips: offer.totalSkips,
      clickThroughRate: offer.clickThroughRate,
      conversionRate: offer.conversionRate,
      skipRate: offer.skipRate,
      commissionRate: offer.commissionRate,
      avgOrderValue: offer.avgOrderValue,
    });

    if (eligibility.eligible) {
      eligibleOffers.push({ ...offer, evi });
    }
  }

  // No eligible offers found
  if (eligibleOffers.length === 0) {
    return null;
  }

  // Sort by EVI (descending), then by impressions today (ascending for fair rotation)
  eligibleOffers.sort((a, b) => {
    // Primary sort: higher EVI first
    const eviDiff = b.evi - a.evi;
    if (Math.abs(eviDiff) > 0.0001) { // Allow small floating point tolerance
      return eviDiff;
    }
    // Tie-breaker: fewer impressions today wins
    return a.impressionsToday - b.impressionsToday;
  });

  const selectedOffer = eligibleOffers[0];

  // Determine selection reason
  let selectionReason = 'Highest EVI score';
  if (eligibleOffers.length > 1) {
    const secondBest = eligibleOffers[1];
    if (Math.abs(selectedOffer.evi - secondBest.evi) < 0.0001) {
      selectionReason = 'Tied EVI - selected due to fewer impressions today (fair rotation)';
    }
  }

  const response: GetOfferResponse = {
    offerId: selectedOffer.id,
    advertiser: selectedOffer.advertiserName,
    score: Math.round(selectedOffer.evi * 10000) / 10000,
    offer: {
      title: selectedOffer.title,
      description: selectedOffer.description,
      discountType: selectedOffer.discountType,
      discountValue: selectedOffer.discountValue,
      offerUrl: selectedOffer.offerUrl,
    },
  };

  // Include debug info if requested
  if (includeDebug) {
    const debugInfo: MatchingDebugInfo = {
      merchantCategory: merchant.category,
      eligibleOffersCount: eligibleOffers.length,
      selectedOfferId: selectedOffer.id,
      selectionReason,
      allCandidates: candidates,
    };
    response.debug = debugInfo;
  }

  return response;
}

/**
 * Get all offers sorted by EVI for a category
 * Useful for debugging and understanding offer rankings
 */
export function getOfferRankings(
  offers: Offer[],
  category: string
): Array<{ offer: Offer; evi: number; rank: number }> {
  const categoryOffers = offers
    .filter(o => o.category === category && o.isActive)
    .map(o => ({ offer: o, evi: calculateEVI(o) }))
    .sort((a, b) => b.evi - a.evi);

  return categoryOffers.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
