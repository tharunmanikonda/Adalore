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
 */
export function isOfferEligible(
  offer: Offer,
  merchant: Merchant,
  merchantAdvertiserId?: string
): { eligible: boolean; reason?: string } {
  if (!offer.isActive) {
    return { eligible: false, reason: 'Offer is not active' };
  }

  if (offer.category !== merchant.category) {
    return { eligible: false, reason: `Category mismatch: ${offer.category} vs ${merchant.category}` };
  }

  if (merchantAdvertiserId && offer.advertiserId === merchantAdvertiserId) {
    return { eligible: false, reason: 'Cannot show merchant their own offers' };
  }

  return { eligible: true };
}

/**
 * Select the next offer to show for a merchant
 */
export function selectNextOffer(
  offers: Offer[],
  merchant: Merchant,
  merchantAdvertiserId?: string,
  includeDebug: boolean = false
): GetOfferResponse | null {
  const candidates: CandidateOffer[] = [];
  const eligibleOffers: Array<Offer & { evi: number }> = [];

  for (const offer of offers) {
    const eligibility = isOfferEligible(offer, merchant, merchantAdvertiserId);
    const evi = calculateEVI(offer);

    candidates.push({
      offerId: offer.id,
      advertiserName: offer.advertiserName,
      evi: Math.round(evi * 10000) / 10000,
      impressionsToday: offer.impressionsToday,
      eligible: eligibility.eligible,
      ineligibleReason: eligibility.reason,
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

  if (eligibleOffers.length === 0) {
    return null;
  }

  eligibleOffers.sort((a, b) => {
    const eviDiff = b.evi - a.evi;
    if (Math.abs(eviDiff) > 0.0001) {
      return eviDiff;
    }
    return a.impressionsToday - b.impressionsToday;
  });

  const selectedOffer = eligibleOffers[0];

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
