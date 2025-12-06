import type { Merchant, Advertiser, Offer } from '../types';

// Mock Merchants (Hosts)
export const merchants: Merchant[] = [
  {
    id: 'merchant-1',
    name: 'SportyGear',
    category: 'fitness',
    shopifyStoreId: 'sporty-gear-store',
    domain: 'sportygear.com',
    isActive: true,
  },
  {
    id: 'merchant-2',
    name: 'GlowBeauty',
    category: 'beauty',
    shopifyStoreId: 'glow-beauty-store',
    domain: 'glowbeauty.com',
    isActive: true,
  },
  {
    id: 'merchant-3',
    name: 'TechZone',
    category: 'electronics',
    shopifyStoreId: 'tech-zone-store',
    domain: 'techzone.com',
    isActive: true,
  },
  {
    id: 'merchant-4',
    name: 'YogaLife',
    category: 'fitness',
    shopifyStoreId: 'yoga-life-store',
    domain: 'yogalife.com',
    isActive: true,
  },
];

// Mock Advertisers (Brands)
export const advertisers: Advertiser[] = [
  {
    id: 'adv-1',
    name: 'FitPro Supplements',
    category: 'fitness',
    logoUrl: 'https://placehold.co/100x100/10B981/white?text=FitPro',
    websiteUrl: 'https://fitpro.example.com',
    isActive: true,
  },
  {
    id: 'adv-2',
    name: 'RunFast Shoes',
    category: 'fitness',
    logoUrl: 'https://placehold.co/100x100/3B82F6/white?text=RunFast',
    websiteUrl: 'https://runfast.example.com',
    isActive: true,
  },
  {
    id: 'adv-3',
    name: 'LuxeSkin',
    category: 'beauty',
    logoUrl: 'https://placehold.co/100x100/EC4899/white?text=LuxeSkin',
    websiteUrl: 'https://luxeskin.example.com',
    isActive: true,
  },
  {
    id: 'adv-4',
    name: 'GadgetWorld',
    category: 'electronics',
    logoUrl: 'https://placehold.co/100x100/8B5CF6/white?text=Gadget',
    websiteUrl: 'https://gadgetworld.example.com',
    isActive: true,
  },
  {
    id: 'adv-5',
    name: 'ZenYoga Mats',
    category: 'fitness',
    logoUrl: 'https://placehold.co/100x100/F59E0B/white?text=ZenYoga',
    websiteUrl: 'https://zenyoga.example.com',
    isActive: true,
  },
  {
    id: 'adv-6',
    name: 'PowerLift Gear',
    category: 'fitness',
    logoUrl: 'https://placehold.co/100x100/EF4444/white?text=PowerLift',
    websiteUrl: 'https://powerlift.example.com',
    isActive: true,
  },
];

// Mock Offers
export const offers: Offer[] = [
  // Fitness offers
  {
    id: 'offer-1',
    advertiserId: 'adv-1',
    advertiserName: 'FitPro Supplements',
    title: '20% Off Protein Powder',
    description: 'Premium whey protein for your fitness goals',
    discountType: 'percentage',
    discountValue: 20,
    offerUrl: 'https://fitpro.example.com/offer/20off',
    commissionRate: 0.08,    // 8%
    conversionRate: 0.045,   // 4.5%
    avgOrderValue: 75,
    category: 'fitness',
    isActive: true,
    impressionsToday: 150,
  },
  {
    id: 'offer-2',
    advertiserId: 'adv-2',
    advertiserName: 'RunFast Shoes',
    title: '$30 Off Running Shoes',
    description: 'Professional running shoes for every terrain',
    discountType: 'fixed_amount',
    discountValue: 30,
    offerUrl: 'https://runfast.example.com/offer/30off',
    commissionRate: 0.06,    // 6%
    conversionRate: 0.035,   // 3.5%
    avgOrderValue: 120,
    category: 'fitness',
    isActive: true,
    impressionsToday: 200,
  },
  {
    id: 'offer-3',
    advertiserId: 'adv-5',
    advertiserName: 'ZenYoga Mats',
    title: 'Free Shipping on Yoga Mats',
    description: 'Eco-friendly yoga mats with free delivery',
    discountType: 'free_shipping',
    discountValue: 0,
    offerUrl: 'https://zenyoga.example.com/offer/freeship',
    commissionRate: 0.10,    // 10%
    conversionRate: 0.055,   // 5.5%
    avgOrderValue: 65,
    category: 'fitness',
    isActive: true,
    impressionsToday: 80,
  },
  {
    id: 'offer-4',
    advertiserId: 'adv-6',
    advertiserName: 'PowerLift Gear',
    title: '15% Off Weight Sets',
    description: 'Professional weight lifting equipment',
    discountType: 'percentage',
    discountValue: 15,
    offerUrl: 'https://powerlift.example.com/offer/15off',
    commissionRate: 0.07,    // 7%
    conversionRate: 0.040,   // 4.0%
    avgOrderValue: 200,
    category: 'fitness',
    isActive: true,
    impressionsToday: 120,
  },

  // Beauty offers
  {
    id: 'offer-5',
    advertiserId: 'adv-3',
    advertiserName: 'LuxeSkin',
    title: '25% Off Skincare Bundle',
    description: 'Complete skincare routine at a discount',
    discountType: 'percentage',
    discountValue: 25,
    offerUrl: 'https://luxeskin.example.com/offer/25off',
    commissionRate: 0.12,    // 12%
    conversionRate: 0.060,   // 6.0%
    avgOrderValue: 95,
    category: 'beauty',
    isActive: true,
    impressionsToday: 90,
  },

  // Electronics offers
  {
    id: 'offer-6',
    advertiserId: 'adv-4',
    advertiserName: 'GadgetWorld',
    title: '$50 Off Smart Watches',
    description: 'Latest smart watches with health tracking',
    discountType: 'fixed_amount',
    discountValue: 50,
    offerUrl: 'https://gadgetworld.example.com/offer/50off',
    commissionRate: 0.05,    // 5%
    conversionRate: 0.025,   // 2.5%
    avgOrderValue: 250,
    category: 'electronics',
    isActive: true,
    impressionsToday: 180,
  },

  // Additional fitness offer for tie-breaker testing
  {
    id: 'offer-7',
    advertiserId: 'adv-1',
    advertiserName: 'FitPro Supplements',
    title: 'Buy 2 Get 1 Free - Vitamins',
    description: 'Stock up on essential vitamins',
    discountType: 'percentage',
    discountValue: 33,
    offerUrl: 'https://fitpro.example.com/offer/b2g1',
    commissionRate: 0.0715,  // ~7.15% - Creates tie with offer-3 EVI
    conversionRate: 0.055,   // 5.5%
    avgOrderValue: 65,
    category: 'fitness',
    isActive: true,
    impressionsToday: 80,    // Same as offer-3 for testing tie-breaker
  },
];

// In-memory tracking storage (for demo purposes)
export const trackingStore = {
  impressions: new Map<string, { offerId: string; merchantId: string; sessionId: string; createdAt: Date }>(),
  clicks: new Map<string, { impressionId: string; offerId: string; clickedAt: Date }>(),
  dailyImpressionCounts: new Map<string, number>(), // offerId -> count
};

// Helper to get merchant by ID
export function getMerchantById(id: string): Merchant | undefined {
  return merchants.find(m => m.id === id);
}

// Helper to get advertiser by ID
export function getAdvertiserById(id: string): Advertiser | undefined {
  return advertisers.find(a => a.id === id);
}

// Helper to get offer by ID
export function getOfferById(id: string): Offer | undefined {
  return offers.find(o => o.id === id);
}

// Helper to increment impression count
export function incrementImpressionCount(offerId: string): void {
  const offer = offers.find(o => o.id === offerId);
  if (offer) {
    offer.impressionsToday += 1;
  }
}
