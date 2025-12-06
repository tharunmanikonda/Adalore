import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOffers, getActiveOffers, createOffer } from '../_lib/database.js';

/**
 * GET /api/offers - List offers (active=true for active only)
 * POST /api/offers - Create a new offer
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { active } = req.query;
      const offers = active === 'true' ? await getActiveOffers() : await getOffers();
      return res.status(200).json(offers);
    }

    if (req.method === 'POST') {
      const {
        advertiserId,
        title,
        description,
        discountType,
        discountValue,
        offerUrl,
        commissionRate,
        conversionRate,
        avgOrderValue,
        category,
      } = req.body;

      if (!advertiserId || !title || !discountType || !offerUrl || !category) {
        return res.status(400).json({
          error: 'Required fields: advertiserId, title, discountType, offerUrl, category',
        });
      }

      const offer = await createOffer({
        advertiserId,
        title,
        description,
        discountType,
        discountValue: discountValue || 0,
        offerUrl,
        commissionRate: commissionRate || 0.05,
        conversionRate: conversionRate || 0.03,
        avgOrderValue: avgOrderValue || 50,
        category,
      });

      if (!offer) {
        return res.status(500).json({ error: 'Failed to create offer' });
      }

      return res.status(201).json(offer);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/offers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
