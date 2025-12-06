import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdvertisers, createAdvertiser } from '../_lib/database';

/**
 * GET /api/advertisers - List all advertisers
 * POST /api/advertisers - Create a new advertiser
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
      const advertisers = await getAdvertisers();
      return res.status(200).json(advertisers);
    }

    if (req.method === 'POST') {
      const { name, category, logoUrl, websiteUrl } = req.body;

      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }

      const advertiser = await createAdvertiser({
        name,
        category,
        logoUrl,
        websiteUrl,
      });

      if (!advertiser) {
        return res.status(500).json({ error: 'Failed to create advertiser' });
      }

      return res.status(201).json(advertiser);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/advertisers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
