import { describe, it, expect } from 'vitest';
import {
  calculateEVI,
  isOfferEligible,
  selectNextOffer,
  getOfferRankings,
} from '../frontend/services/matchingEngine';
import type { Merchant, Offer } from '../frontend/types';

// Test data
const createMerchant = (overrides: Partial<Merchant> = {}): Merchant => ({
  id: 'merchant-test',
  name: 'Test Merchant',
  category: 'fitness',
  isActive: true,
  ...overrides,
});

const createOffer = (overrides: Partial<Offer> = {}): Offer => ({
  id: 'offer-test',
  advertiserId: 'adv-test',
  advertiserName: 'Test Advertiser',
  title: 'Test Offer',
  description: 'Test description',
  discountType: 'percentage',
  discountValue: 20,
  offerUrl: 'https://test.com/offer',
  commissionRate: 0.05,
  conversionRate: 0.03,
  avgOrderValue: 100,
  category: 'fitness',
  isActive: true,
  impressionsToday: 100,
  totalImpressions: 1000,
  totalClicks: 100,
  totalSales: 30,
  totalRevenue: 3000,
  clickThroughRate: 0.1,
  totalSkips: 50,
  skipRate: 0.05,
  ...overrides,
});

describe('calculateEVI', () => {
  it('calculates EVI correctly', () => {
    const offer = createOffer({
      commissionRate: 0.05,    // 5%
      conversionRate: 0.03,    // 3%
      avgOrderValue: 100,
    });

    const evi = calculateEVI(offer);

    // EVI = 0.05 * 0.03 * 100 = 0.15
    expect(evi).toBeCloseTo(0.15, 4);
  });

  it('handles different values', () => {
    const offer = createOffer({
      commissionRate: 0.10,    // 10%
      conversionRate: 0.05,    // 5%
      avgOrderValue: 200,
    });

    const evi = calculateEVI(offer);

    // EVI = 0.10 * 0.05 * 200 = 1.0
    expect(evi).toBeCloseTo(1.0, 4);
  });

  it('returns 0 for zero values', () => {
    const offer = createOffer({
      commissionRate: 0,
      conversionRate: 0.03,
      avgOrderValue: 100,
    });

    expect(calculateEVI(offer)).toBe(0);
  });
});

describe('isOfferEligible', () => {
  const merchant = createMerchant({ category: 'fitness' });

  it('returns eligible for matching category', () => {
    const offer = createOffer({ category: 'fitness', isActive: true });
    const result = isOfferEligible(offer, merchant);

    expect(result.eligible).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns ineligible for non-matching category', () => {
    const offer = createOffer({ category: 'beauty', isActive: true });
    const result = isOfferEligible(offer, merchant);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Category mismatch');
  });

  it('returns ineligible for inactive offers', () => {
    const offer = createOffer({ category: 'fitness', isActive: false });
    const result = isOfferEligible(offer, merchant);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('not active');
  });

  it('excludes own offers when merchant is also an advertiser', () => {
    const offer = createOffer({ advertiserId: 'adv-123', category: 'fitness' });
    const result = isOfferEligible(offer, merchant, 'adv-123');

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('own offers');
  });

  it('allows offers from other advertisers', () => {
    const offer = createOffer({ advertiserId: 'adv-123', category: 'fitness' });
    const result = isOfferEligible(offer, merchant, 'adv-456');

    expect(result.eligible).toBe(true);
  });
});

describe('selectNextOffer', () => {
  const merchant = createMerchant({ category: 'fitness' });

  it('returns null when no offers available', () => {
    const result = selectNextOffer([], merchant);
    expect(result).toBeNull();
  });

  it('returns null when no eligible offers', () => {
    const offers = [
      createOffer({ id: 'offer-1', category: 'beauty' }),
      createOffer({ id: 'offer-2', category: 'electronics' }),
    ];

    const result = selectNextOffer(offers, merchant);
    expect(result).toBeNull();
  });

  it('selects offer with highest EVI', () => {
    const offers = [
      createOffer({
        id: 'offer-low',
        commissionRate: 0.02,
        conversionRate: 0.01,
        avgOrderValue: 50,
      }),
      createOffer({
        id: 'offer-high',
        commissionRate: 0.10,
        conversionRate: 0.05,
        avgOrderValue: 200,
      }),
      createOffer({
        id: 'offer-mid',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 100,
      }),
    ];

    const result = selectNextOffer(offers, merchant);

    expect(result).not.toBeNull();
    expect(result!.offerId).toBe('offer-high');
  });

  it('uses fair rotation (fewer impressions) for tied EVIs', () => {
    const offers = [
      createOffer({
        id: 'offer-more-impressions',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 100,
        impressionsToday: 200,
      }),
      createOffer({
        id: 'offer-fewer-impressions',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 100,
        impressionsToday: 50,
      }),
    ];

    const result = selectNextOffer(offers, merchant);

    expect(result).not.toBeNull();
    expect(result!.offerId).toBe('offer-fewer-impressions');
  });

  it('excludes inactive offers', () => {
    const offers = [
      createOffer({
        id: 'offer-inactive',
        commissionRate: 0.20,
        isActive: false,
      }),
      createOffer({
        id: 'offer-active',
        commissionRate: 0.05,
        isActive: true,
      }),
    ];

    const result = selectNextOffer(offers, merchant);

    expect(result).not.toBeNull();
    expect(result!.offerId).toBe('offer-active');
  });

  it('excludes offers from different categories', () => {
    const offers = [
      createOffer({
        id: 'offer-beauty',
        category: 'beauty',
        commissionRate: 0.20,
      }),
      createOffer({
        id: 'offer-fitness',
        category: 'fitness',
        commissionRate: 0.05,
      }),
    ];

    const result = selectNextOffer(offers, merchant);

    expect(result).not.toBeNull();
    expect(result!.offerId).toBe('offer-fitness');
  });

  it('includes debug info when requested', () => {
    const offers = [
      createOffer({ id: 'offer-1' }),
      createOffer({ id: 'offer-2', category: 'beauty' }),
    ];

    const result = selectNextOffer(offers, merchant, undefined, true);

    expect(result).not.toBeNull();
    expect(result!.debug).toBeDefined();
    expect(result!.debug!.merchantCategory).toBe('fitness');
    expect(result!.debug!.eligibleOffersCount).toBe(1);
    expect(result!.debug!.allCandidates).toHaveLength(2);
  });

  it('returns correct response structure', () => {
    const offers = [
      createOffer({
        id: 'offer-1',
        advertiserName: 'Test Brand',
        title: 'Great Offer',
        description: 'Amazing deal',
        discountType: 'percentage',
        discountValue: 20,
        offerUrl: 'https://test.com',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 100,
      }),
    ];

    const result = selectNextOffer(offers, merchant);

    expect(result).toMatchObject({
      offerId: 'offer-1',
      advertiser: 'Test Brand',
      score: expect.any(Number),
      offer: {
        title: 'Great Offer',
        description: 'Amazing deal',
        discountType: 'percentage',
        discountValue: 20,
        offerUrl: 'https://test.com',
      },
    });
  });
});

describe('getOfferRankings', () => {
  it('returns offers sorted by EVI with rank', () => {
    const offers = [
      createOffer({
        id: 'offer-low',
        commissionRate: 0.02,
        conversionRate: 0.01,
        avgOrderValue: 50,
      }),
      createOffer({
        id: 'offer-high',
        commissionRate: 0.10,
        conversionRate: 0.05,
        avgOrderValue: 200,
      }),
      createOffer({
        id: 'offer-mid',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 100,
      }),
    ];

    const rankings = getOfferRankings(offers, 'fitness');

    expect(rankings).toHaveLength(3);
    expect(rankings[0].rank).toBe(1);
    expect(rankings[0].offer.id).toBe('offer-high');
    expect(rankings[1].rank).toBe(2);
    expect(rankings[2].rank).toBe(3);
  });

  it('filters by category', () => {
    const offers = [
      createOffer({ id: 'offer-fitness', category: 'fitness' }),
      createOffer({ id: 'offer-beauty', category: 'beauty' }),
    ];

    const rankings = getOfferRankings(offers, 'fitness');

    expect(rankings).toHaveLength(1);
    expect(rankings[0].offer.id).toBe('offer-fitness');
  });

  it('excludes inactive offers', () => {
    const offers = [
      createOffer({ id: 'offer-active', isActive: true }),
      createOffer({ id: 'offer-inactive', isActive: false }),
    ];

    const rankings = getOfferRankings(offers, 'fitness');

    expect(rankings).toHaveLength(1);
    expect(rankings[0].offer.id).toBe('offer-active');
  });
});
