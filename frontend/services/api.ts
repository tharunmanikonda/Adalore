import type { Merchant, Offer } from '../types';

// API base URL - empty for same-origin requests
const API_BASE = '';

// ============================================================================
// MERCHANT OPERATIONS
// ============================================================================

export async function getMerchants(): Promise<Merchant[]> {
  const res = await fetch(`${API_BASE}/api/merchants`);
  if (!res.ok) return [];
  return res.json();
}

export async function createMerchant(merchant: Omit<Merchant, 'id'>): Promise<Merchant | null> {
  const res = await fetch(`${API_BASE}/api/merchants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(merchant),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteMerchant(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/merchants/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

// ============================================================================
// ADVERTISER OPERATIONS
// ============================================================================

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
}

export async function getAdvertisers(): Promise<Advertiser[]> {
  const res = await fetch(`${API_BASE}/api/advertisers`);
  if (!res.ok) return [];
  return res.json();
}

export async function createAdvertiser(advertiser: {
  name: string;
  category: string;
  logoUrl?: string;
  websiteUrl?: string;
}): Promise<Advertiser | null> {
  const res = await fetch(`${API_BASE}/api/advertisers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(advertiser),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteAdvertiser(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/advertisers/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

// ============================================================================
// OFFER OPERATIONS
// ============================================================================

export async function getOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/api/offers`);
  if (!res.ok) return [];
  return res.json();
}

export async function getActiveOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/api/offers?active=true`);
  if (!res.ok) return [];
  return res.json();
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
  const res = await fetch(`${API_BASE}/api/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteOffer(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/offers/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

// ============================================================================
// TRACKING OPERATIONS
// ============================================================================

export async function recordOfferImpression(offerId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/track/impression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });
  return res.ok;
}

export async function recordOfferClick(offerId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/track/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });
  return res.ok;
}

export async function recordOfferSkip(offerId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/track/skip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });
  return res.ok;
}
