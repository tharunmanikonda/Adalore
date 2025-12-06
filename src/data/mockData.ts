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
  {
    id: 'adv-7',
    name: 'GlowUp Cosmetics',
    category: 'beauty',
    logoUrl: 'https://placehold.co/100x100/F472B6/white?text=GlowUp',
    websiteUrl: 'https://glowup.example.com',
    isActive: true,
  },
  {
    id: 'adv-8',
    name: 'BeautyBox',
    category: 'beauty',
    logoUrl: 'https://placehold.co/100x100/A855F7/white?text=BeautyBox',
    websiteUrl: 'https://beautybox.example.com',
    isActive: true,
  },
];

// Mock Offers with FULL tracking metrics
export const offers: Offer[] = [
  // FITNESS OFFERS
  {
    id: 'offer-1',
    advertiserId: 'adv-1',
    advertiserName: 'FitPro Supplements',
    title: '20% Off Protein Powder',
    description: 'Premium whey protein for your fitness goals',
    discountType: 'percentage',
    discountValue: 20,
    offerUrl: 'https://fitpro.example.com/offer/20off',
    category: 'fitness',
    isActive: true,
    // Business setting
    commissionRate: 0.08,  // 8%
    // Tracking data
    totalImpressions: 1000,
    totalClicks: 120,      // 12% CTR - Good!
    totalSales: 45,        // 4.5% conversion
    totalRevenue: 3375,    // $75 AOV
    // Calculated
    clickThroughRate: 0.12,
    conversionRate: 0.045,
    avgOrderValue: 75,
    impressionsToday: 150,
    // Skip tracking
    totalSkips: 150,         // 15% skip rate
    skipRate: 0.15,
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
    category: 'fitness',
    isActive: true,
    commissionRate: 0.06,  // 6%
    totalImpressions: 1200,
    totalClicks: 80,       // 6.7% CTR - Lower
    totalSales: 35,        // 2.9% conversion
    totalRevenue: 4200,    // $120 AOV - High!
    clickThroughRate: 0.067,
    conversionRate: 0.029,
    avgOrderValue: 120,
    impressionsToday: 200,
    totalSkips: 240,         // 20% skip rate - higher due to lower CTR
    skipRate: 0.20,
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
    category: 'fitness',
    isActive: true,
    commissionRate: 0.10,  // 10%
    totalImpressions: 800,
    totalClicks: 150,      // 18.75% CTR - Excellent!
    totalSales: 55,        // 6.9% conversion - Great!
    totalRevenue: 3575,    // $65 AOV
    clickThroughRate: 0.1875,
    conversionRate: 0.069,
    avgOrderValue: 65,
    impressionsToday: 80,
    totalSkips: 80,          // 10% skip rate - low (popular offer)
    skipRate: 0.10,
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
    category: 'fitness',
    isActive: true,
    commissionRate: 0.07,  // 7%
    totalImpressions: 600,
    totalClicks: 60,       // 10% CTR
    totalSales: 20,        // 3.3% conversion
    totalRevenue: 4000,    // $200 AOV - Highest!
    clickThroughRate: 0.10,
    conversionRate: 0.033,
    avgOrderValue: 200,
    impressionsToday: 120,
    totalSkips: 108,         // 18% skip rate
    skipRate: 0.18,
  },

  // BEAUTY OFFERS
  {
    id: 'offer-5',
    advertiserId: 'adv-3',
    advertiserName: 'LuxeSkin',
    title: '25% Off Skincare Bundle',
    description: 'Complete skincare routine at a discount',
    discountType: 'percentage',
    discountValue: 25,
    offerUrl: 'https://luxeskin.example.com/offer/25off',
    category: 'beauty',
    isActive: true,
    commissionRate: 0.12,  // 12%
    totalImpressions: 900,
    totalClicks: 135,      // 15% CTR
    totalSales: 60,        // 6.7% conversion
    totalRevenue: 5700,    // $95 AOV
    clickThroughRate: 0.15,
    conversionRate: 0.067,
    avgOrderValue: 95,
    impressionsToday: 90,
    totalSkips: 117,         // 13% skip rate
    skipRate: 0.13,
  },
  {
    id: 'offer-6',
    advertiserId: 'adv-7',
    advertiserName: 'GlowUp Cosmetics',
    title: '30% Off Lipstick Collection',
    description: 'Premium lipsticks in trending colors',
    discountType: 'percentage',
    discountValue: 30,
    offerUrl: 'https://glowup.example.com/offer/30off',
    category: 'beauty',
    isActive: true,
    commissionRate: 0.10,  // 10%
    totalImpressions: 700,
    totalClicks: 140,      // 20% CTR - Best CTR!
    totalSales: 35,        // 5% conversion
    totalRevenue: 1575,    // $45 AOV - Low
    clickThroughRate: 0.20,
    conversionRate: 0.05,
    avgOrderValue: 45,
    impressionsToday: 60,
    totalSkips: 56,          // 8% skip rate - very low (attractive offer)
    skipRate: 0.08,
  },
  {
    id: 'offer-7',
    advertiserId: 'adv-8',
    advertiserName: 'BeautyBox',
    title: 'Free Beauty Box with $50+ Order',
    description: 'Curated beauty samples with your purchase',
    discountType: 'free_shipping',
    discountValue: 0,
    offerUrl: 'https://beautybox.example.com/offer/freebox',
    category: 'beauty',
    isActive: true,
    commissionRate: 0.15,  // 15% - Highest commission!
    totalImpressions: 500,
    totalClicks: 100,      // 20% CTR
    totalSales: 70,        // 14% conversion - Best!
    totalRevenue: 5600,    // $80 AOV
    clickThroughRate: 0.20,
    conversionRate: 0.14,
    avgOrderValue: 80,
    impressionsToday: 40,
    totalSkips: 30,          // 6% skip rate - lowest (best performing)
    skipRate: 0.06,
  },

  // ELECTRONICS OFFER
  {
    id: 'offer-8',
    advertiserId: 'adv-4',
    advertiserName: 'GadgetWorld',
    title: '$50 Off Smart Watches',
    description: 'Latest smart watches with health tracking',
    discountType: 'fixed_amount',
    discountValue: 50,
    offerUrl: 'https://gadgetworld.example.com/offer/50off',
    category: 'electronics',
    isActive: true,
    commissionRate: 0.05,  // 5%
    totalImpressions: 1100,
    totalClicks: 90,       // 8.2% CTR
    totalSales: 25,        // 2.3% conversion
    totalRevenue: 6250,    // $250 AOV
    clickThroughRate: 0.082,
    conversionRate: 0.023,
    avgOrderValue: 250,
    impressionsToday: 180,
    totalSkips: 275,         // 25% skip rate - high (expensive product)
    skipRate: 0.25,
  },
];

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
    offer.totalImpressions += 1;
    // Recalculate rates
    offer.clickThroughRate = offer.totalClicks / offer.totalImpressions;
    offer.conversionRate = offer.totalSales / offer.totalImpressions;
  }
}

// Helper to record a click
export function recordClick(offerId: string): void {
  const offer = offers.find(o => o.id === offerId);
  if (offer) {
    offer.totalClicks += 1;
    offer.clickThroughRate = offer.totalClicks / offer.totalImpressions;
  }
}

// Helper to record a sale
export function recordSale(offerId: string, amount: number): void {
  const offer = offers.find(o => o.id === offerId);
  if (offer) {
    offer.totalSales += 1;
    offer.totalRevenue += amount;
    offer.conversionRate = offer.totalSales / offer.totalImpressions;
    offer.avgOrderValue = offer.totalRevenue / offer.totalSales;
  }
}
