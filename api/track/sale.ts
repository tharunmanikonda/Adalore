import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordSale } from '../_lib/database.js';

/**
 * POST /api/track/sale
 *
 * Body:
 * - offerId (required): The offer ID to record sale for
 * - amount (required): The sale amount
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { offerId, amount } = req.body;

  if (!offerId || typeof offerId !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameter: offerId',
    });
  }

  if (amount === undefined || typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({
      error: 'Missing or invalid parameter: amount',
    });
  }

  try {
    const success = await recordSale(offerId, amount);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (success) {
      return res.status(200).json({
        success: true,
        offerId,
        amount,
        event: 'sale',
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({ error: 'Failed to record sale' });
    }
  } catch (error) {
    console.error('Error in /api/track/sale:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
