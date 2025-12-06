import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Merchant, Offer } from '../types';

// Database types (snake_case from Supabase)
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

// Transform functions
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
// READ OPERATIONS (Frontend can read directly from Supabase)
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

// ============================================================================
// WRITE OPERATIONS (Frontend uses Supabase directly for admin panel)
// ============================================================================

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
// TRACKING OPERATIONS (Frontend uses Supabase RPC)
// ============================================================================

export async function recordOfferImpression(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_impression', { offer_uuid: id });

  if (error) {
    const { data } = await supabase
      .from('offers')
      .select('impressions_today, total_impressions')
      .eq('id', id)
      .single();

    if (data) {
      await supabase
        .from('offers')
        .update({
          impressions_today: (data.impressions_today || 0) + 1,
          total_impressions: (data.total_impressions || 0) + 1,
        })
        .eq('id', id);
    }
  }

  return true;
}

export async function recordOfferClick(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_click', { offer_uuid: id });

  if (error) {
    const { data } = await supabase
      .from('offers')
      .select('total_clicks, total_impressions')
      .eq('id', id)
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
        .eq('id', id);
    }
  }

  return true;
}

export async function recordOfferSkip(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('record_skip', { offer_uuid: id });

  if (error) {
    const { data } = await supabase
      .from('offers')
      .select('total_skips, total_impressions')
      .eq('id', id)
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
        .eq('id', id);
    }
  }

  return true;
}
