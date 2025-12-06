import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================
export interface Merchant {
  id: string;
  name: string;
  category: string;
  domain?: string;
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

interface DbMerchant {
  id: string;
  name: string;
  category: string;
  domain: string | null;
  is_active: boolean;
}

interface DbAdvertiser {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
}

interface DbOffer {
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
  advertisers?: DbAdvertiser;
}

function dbToMerchant(db: DbMerchant): Merchant {
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    domain: db.domain || undefined,
    isActive: db.is_active,
  };
}

function dbToOffer(db: DbOffer): Offer {
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

// ============================================================================
// MERCHANT OPERATIONS
// ============================================================================
export async function getMerchants(): Promise<Merchant[]> {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching merchants:', error);
    return [];
  }
  return (data as DbMerchant[]).map(dbToMerchant);
}

export async function getMerchantById(id: string): Promise<Merchant | null> {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return dbToMerchant(data as DbMerchant);
}

export async function createMerchant(merchant: Omit<Merchant, 'id'>): Promise<Merchant | null> {
  const { data, error } = await supabase
    .from('merchants')
    .insert({
      name: merchant.name,
      category: merchant.category,
      domain: merchant.domain || null,
      is_active: merchant.isActive,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating merchant:', error);
    return null;
  }
  return dbToMerchant(data as DbMerchant);
}

export async function updateMerchant(id: string, merchant: Partial<Merchant>): Promise<boolean> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (merchant.name !== undefined) updates.name = merchant.name;
  if (merchant.category !== undefined) updates.category = merchant.category;
  if (merchant.domain !== undefined) updates.domain = merchant.domain;
  if (merchant.isActive !== undefined) updates.is_active = merchant.isActive;

  const { error } = await supabase.from('merchants').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating merchant:', error);
    return false;
  }
  return true;
}

export async function deleteMerchant(id: string): Promise<boolean> {
  const { error } = await supabase.from('merchants').delete().eq('id', id);
  if (error) {
    console.error('Error deleting merchant:', error);
    return false;
  }
  return true;
}

// ============================================================================
// ADVERTISER OPERATIONS
// ============================================================================
export async function getAdvertisers(): Promise<DbAdvertiser[]> {
  const { data, error } = await supabase
    .from('advertisers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching advertisers:', error);
    return [];
  }
  return data as DbAdvertiser[];
}

export async function createAdvertiser(advertiser: {
  name: string;
  category: string;
  logoUrl?: string;
  websiteUrl?: string;
}): Promise<DbAdvertiser | null> {
  const { data, error } = await supabase
    .from('advertisers')
    .insert({
      name: advertiser.name,
      category: advertiser.category,
      logo_url: advertiser.logoUrl || null,
      website_url: advertiser.websiteUrl || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating advertiser:', error);
    return null;
  }
  return data as DbAdvertiser;
}

export async function deleteAdvertiser(id: string): Promise<boolean> {
  const { error } = await supabase.from('advertisers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting advertiser:', error);
    return false;
  }
  return true;
}

// ============================================================================
// OFFER OPERATIONS
// ============================================================================
export async function getOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`*, advertisers (id, name, category, logo_url)`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
  return (data as DbOffer[]).map(dbToOffer);
}

export async function getActiveOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`*, advertisers (id, name, category, logo_url)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active offers:', error);
    return [];
  }
  return (data as DbOffer[]).map(dbToOffer);
}

export async function createOffer(offer: {
  advertiserId: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  offerUrl: string;
  commissionRate: number;
  conversionRate: number;
  avgOrderValue: number;
  category: string;
}): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      advertiser_id: offer.advertiserId,
      title: offer.title,
      description: offer.description || null,
      discount_type: offer.discountType,
      discount_value: offer.discountValue,
      offer_url: offer.offerUrl,
      commission_rate: offer.commissionRate,
      conversion_rate: offer.conversionRate,
      avg_order_value: offer.avgOrderValue,
      category: offer.category,
      is_active: true,
      impressions_today: 0,
    })
    .select(`*, advertisers (id, name, category, logo_url)`)
    .single();

  if (error) {
    console.error('Error creating offer:', error);
    return null;
  }
  return dbToOffer(data as DbOffer);
}

export async function updateOffer(id: string, offer: Partial<{
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  offerUrl: string;
  commissionRate: number;
  conversionRate: number;
  avgOrderValue: number;
  category: string;
  isActive: boolean;
}>): Promise<boolean> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (offer.title !== undefined) updates.title = offer.title;
  if (offer.description !== undefined) updates.description = offer.description;
  if (offer.discountType !== undefined) updates.discount_type = offer.discountType;
  if (offer.discountValue !== undefined) updates.discount_value = offer.discountValue;
  if (offer.offerUrl !== undefined) updates.offer_url = offer.offerUrl;
  if (offer.commissionRate !== undefined) updates.commission_rate = offer.commissionRate;
  if (offer.conversionRate !== undefined) updates.conversion_rate = offer.conversionRate;
  if (offer.avgOrderValue !== undefined) updates.avg_order_value = offer.avgOrderValue;
  if (offer.category !== undefined) updates.category = offer.category;
  if (offer.isActive !== undefined) updates.is_active = offer.isActive;

  const { error } = await supabase.from('offers').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating offer:', error);
    return false;
  }
  return true;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting offer:', error);
    return false;
  }
  return true;
}

// ============================================================================
// TRACKING OPERATIONS
// ============================================================================
export async function recordImpression(offerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('offers')
    .select('impressions_today, total_impressions')
    .eq('id', offerId)
    .single();

  if (data) {
    await supabase
      .from('offers')
      .update({
        impressions_today: (data.impressions_today || 0) + 1,
        total_impressions: (data.total_impressions || 0) + 1,
      })
      .eq('id', offerId);
  }
  return true;
}

export async function recordClick(offerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('offers')
    .select('total_clicks, total_impressions')
    .eq('id', offerId)
    .single();

  if (data) {
    const newClicks = (data.total_clicks || 0) + 1;
    const ctr = data.total_impressions > 0 ? newClicks / data.total_impressions : 0;
    await supabase
      .from('offers')
      .update({ total_clicks: newClicks, click_through_rate: ctr })
      .eq('id', offerId);
  }
  return true;
}

export async function recordSkip(offerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('offers')
    .select('total_skips, total_impressions')
    .eq('id', offerId)
    .single();

  if (data) {
    const newSkips = (data.total_skips || 0) + 1;
    const skipRate = data.total_impressions > 0 ? newSkips / data.total_impressions : 0;
    await supabase
      .from('offers')
      .update({ total_skips: newSkips, skip_rate: skipRate })
      .eq('id', offerId);
  }
  return true;
}

export async function recordSale(offerId: string, amount: number): Promise<boolean> {
  const { data } = await supabase
    .from('offers')
    .select('total_sales, total_revenue, total_impressions')
    .eq('id', offerId)
    .single();

  if (data) {
    const newSales = (data.total_sales || 0) + 1;
    const newRevenue = (data.total_revenue || 0) + amount;
    const convRate = data.total_impressions > 0 ? newSales / data.total_impressions : 0;
    const aov = newSales > 0 ? newRevenue / newSales : 0;
    await supabase
      .from('offers')
      .update({
        total_sales: newSales,
        total_revenue: newRevenue,
        conversion_rate: convRate,
        avg_order_value: aov,
      })
      .eq('id', offerId);
  }
  return true;
}

// ============================================================================
// MATCHING ENGINE
// ============================================================================
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

function calculateEVI(offer: Offer): number {
  return offer.commissionRate * offer.conversionRate * offer.avgOrderValue;
}

function isOfferEligible(
  offer: Offer,
  merchant: Merchant
): { eligible: boolean; reason?: string } {
  if (!offer.isActive) {
    return { eligible: false, reason: 'Offer is not active' };
  }
  if (offer.category !== merchant.category) {
    return { eligible: false, reason: `Category mismatch: ${offer.category} vs ${merchant.category}` };
  }
  return { eligible: true };
}

export function selectNextOffer(
  offers: Offer[],
  merchant: Merchant,
  includeDebug: boolean = false
): GetOfferResponse | null {
  const candidates: CandidateOffer[] = [];
  const eligibleOffers: Array<Offer & { evi: number }> = [];

  for (const offer of offers) {
    const eligibility = isOfferEligible(offer, merchant);
    const evi = calculateEVI(offer);

    candidates.push({
      offerId: offer.id,
      advertiserName: offer.advertiserName,
      evi: Math.round(evi * 10000) / 10000,
      impressionsToday: offer.impressionsToday,
      eligible: eligibility.eligible,
      ineligibleReason: eligibility.reason,
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
    response.debug = {
      merchantCategory: merchant.category,
      eligibleOffersCount: eligibleOffers.length,
      selectedOfferId: selectedOffer.id,
      selectionReason,
      allCandidates: candidates,
    };
  }

  return response;
}
