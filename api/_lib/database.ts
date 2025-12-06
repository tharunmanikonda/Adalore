import { supabase, isSupabaseConfigured } from './supabase.js';
import type { Merchant, Offer, DbMerchant, DbOffer, DbAdvertiser } from './types.js';
import { dbToMerchant, dbToOffer } from './types.js';

// ============================================================================
// MERCHANT OPERATIONS
// ============================================================================

export async function getMerchants(): Promise<Merchant[]> {
  if (!isSupabaseConfigured) return [];

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
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return dbToMerchant(data as DbMerchant);
}

export async function createMerchant(merchant: Omit<Merchant, 'id'>): Promise<Merchant | null> {
  if (!isSupabaseConfigured) return null;

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
  if (!isSupabaseConfigured) return false;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (merchant.name !== undefined) updates.name = merchant.name;
  if (merchant.category !== undefined) updates.category = merchant.category;
  if (merchant.domain !== undefined) updates.domain = merchant.domain;
  if (merchant.isActive !== undefined) updates.is_active = merchant.isActive;

  const { error } = await supabase
    .from('merchants')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating merchant:', error);
    return false;
  }

  return true;
}

export async function deleteMerchant(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('merchants')
    .delete()
    .eq('id', id);

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
  if (!isSupabaseConfigured) return [];

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
  if (!isSupabaseConfigured) return null;

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
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('advertisers')
    .delete()
    .eq('id', id);

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
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      advertisers (
        id,
        name,
        category,
        logo_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
    return [];
  }

  return (data as DbOffer[]).map(dbToOffer);
}

export async function getActiveOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      advertisers (
        id,
        name,
        category,
        logo_url
      )
    `)
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
  if (!isSupabaseConfigured) return null;

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
    .select(`
      *,
      advertisers (
        id,
        name,
        category,
        logo_url
      )
    `)
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
  if (!isSupabaseConfigured) return false;

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

  const { error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating offer:', error);
    return false;
  }

  return true;
}

export async function deleteOffer(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

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
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_impression', { offer_uuid: offerId });

  if (error) {
    // Fallback to manual update if RPC doesn't exist
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
  }

  return true;
}

export async function recordClick(offerId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_click', { offer_uuid: offerId });

  if (error) {
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
        .update({
          total_clicks: newClicks,
          click_through_rate: ctr,
        })
        .eq('id', offerId);
    }
  }

  return true;
}

export async function recordSkip(offerId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_skip', { offer_uuid: offerId });

  if (error) {
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
        .update({
          total_skips: newSkips,
          skip_rate: skipRate,
        })
        .eq('id', offerId);
    }
  }

  return true;
}

export async function recordSale(offerId: string, amount: number): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_sale', { offer_uuid: offerId, sale_amount: amount });

  if (error) {
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
  }

  return true;
}
