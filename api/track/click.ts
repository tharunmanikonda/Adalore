import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordClick } from '../_lib/database';

/**
 * POST /api/track/click
 *
 * Body:
 * - offerId (required): The offer ID to record click for
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

  const { offerId } = req.body;

  if (!offerId || typeof offerId !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameter: offerId',
    });
  }

  try {
    const success = await recordClick(offerId);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (success) {
      return res.status(200).json({
        success: true,
        offerId,
        event: 'click',
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({ error: 'Failed to record click' });
    }
  } catch (error) {
    console.error('Error in /api/track/click:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
