import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMerchantById, getActiveOffers, recordImpression, selectNextOffer } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { merchantId, orderValue, debug } = req.query;

  if (!merchantId || typeof merchantId !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameter: merchantId',
      example: '/api/offer/next?merchantId=<uuid>&orderValue=60',
    });
  }

  try {
    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: `Merchant not found: ${merchantId}` });
    }

    if (!merchant.isActive) {
      return res.status(403).json({ error: 'Merchant account is not active' });
    }

    const parsedOrderValue = orderValue ? parseFloat(orderValue as string) : undefined;
    const includeDebug = debug === 'true' || debug === '1';

    const offers = await getActiveOffers();
    const result = selectNextOffer(offers, merchant, includeDebug);

    if (!result) {
      return res.status(404).json({
        error: 'No eligible offers found',
        merchantCategory: merchant.category,
        message: `No active offers available in the "${merchant.category}" category`,
      });
    }

    await recordImpression(result.offerId);

    return res.status(200).json({
      ...result,
      meta: {
        merchantId,
        merchantName: merchant.name,
        merchantCategory: merchant.category,
        orderValue: parsedOrderValue,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/offer/next:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
