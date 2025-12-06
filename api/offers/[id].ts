import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteOffer, updateOffer } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Offer ID is required' });
  }

  try {
    if (req.method === 'DELETE') {
      const success = await deleteOffer(id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete offer' });
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      const success = await updateOffer(id, req.body);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update offer' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/offers/[id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
