import type { VercelRequest, VercelResponse } from '@vercel/node';
import { selectNextOffer } from '../_lib/matchingEngine.js';
import { getMerchantById, getActiveOffers, recordImpression } from '../_lib/database.js';

/**
 * GET /api/offer/next
 *
 * Query parameters:
 * - merchantId (required): The merchant requesting an offer
 * - orderValue (optional): The order value (for future use)
 * - debug (optional): Include debug information in response
 *
 * Returns the best matching offer for the merchant based on:
 * 1. Category matching
 * 2. EVI (Expected Value Index) ranking
 * 3. Fair rotation (fewer impressions wins ties)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { merchantId, orderValue, debug } = req.query;

  // Validate required parameters
  if (!merchantId || typeof merchantId !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameter: merchantId',
      example: '/api/offer/next?merchantId=<uuid>&orderValue=60',
    });
  }

  try {
    // Get merchant from database
    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      return res.status(404).json({
        error: `Merchant not found: ${merchantId}`,
      });
    }

    // Check if merchant is active
    if (!merchant.isActive) {
      return res.status(403).json({
        error: 'Merchant account is not active',
      });
    }

    // Parse orderValue if provided
    const parsedOrderValue = orderValue ? parseFloat(orderValue as string) : undefined;

    // Include debug info if requested
    const includeDebug = debug === 'true' || debug === '1';

    // Get active offers from database
    const offers = await getActiveOffers();

    // Select the best offer
    const result = selectNextOffer(offers, merchant, undefined, includeDebug);

    if (!result) {
      return res.status(404).json({
        error: 'No eligible offers found',
        merchantCategory: merchant.category,
        message: `No active offers available in the "${merchant.category}" category`,
      });
    }

    // Record impression in database
    await recordImpression(result.offerId);

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return the selected offer
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
