import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordImpression } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { offerId } = req.body;
  if (!offerId || typeof offerId !== 'string') {
    return res.status(400).json({ error: 'Missing required parameter: offerId' });
  }

  try {
    const success = await recordImpression(offerId);
    if (success) {
      return res.status(200).json({
        success: true,
        offerId,
        event: 'impression',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(500).json({ error: 'Failed to record impression' });
  } catch (error) {
    console.error('Error in /api/track/impression:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
