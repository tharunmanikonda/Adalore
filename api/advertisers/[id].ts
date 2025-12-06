import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteAdvertiser } from '../_lib/database.js';

/**
 * DELETE /api/advertisers/:id - Delete an advertiser
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Advertiser ID is required' });
  }

  try {
    if (req.method === 'DELETE') {
      const success = await deleteAdvertiser(id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete advertiser' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/advertisers/[id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
