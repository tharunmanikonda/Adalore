import type { VercelRequest, VercelResponse } from '@vercel/node';
import { selectNextOffer } from '../../src/services/matchingEngine';
import { offers, getMerchantById, incrementImpressionCount } from '../../src/data/mockData';

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
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { merchantId, orderValue, debug } = req.query;

  // Validate required parameters
  if (!merchantId || typeof merchantId !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameter: merchantId',
      example: '/api/offer/next?merchantId=merchant-1&orderValue=60',
    });
  }

  // Get merchant
  const merchant = getMerchantById(merchantId);
  if (!merchant) {
    return res.status(404).json({
      error: `Merchant not found: ${merchantId}`,
      availableMerchants: ['merchant-1', 'merchant-2', 'merchant-3', 'merchant-4'],
    });
  }

  // Check if merchant is active
  if (!merchant.isActive) {
    return res.status(403).json({
      error: 'Merchant account is not active',
    });
  }

  // Parse orderValue if provided (for future use / logging)
  const parsedOrderValue = orderValue ? parseFloat(orderValue as string) : undefined;

  // Include debug info if requested
  const includeDebug = debug === 'true' || debug === '1';

  // Select the best offer
  const result = selectNextOffer(offers, merchant, undefined, includeDebug);

  if (!result) {
    return res.status(404).json({
      error: 'No eligible offers found',
      merchantCategory: merchant.category,
      message: `No active offers available in the "${merchant.category}" category`,
    });
  }

  // Increment impression count for fair rotation
  incrementImpressionCount(result.offerId);

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
}
