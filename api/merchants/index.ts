import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMerchants, createMerchant } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const merchants = await getMerchants();
      return res.status(200).json(merchants);
    }

    if (req.method === 'POST') {
      const { name, category, domain } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }
      const merchant = await createMerchant({ name, category, domain, isActive: true });
      if (!merchant) {
        return res.status(500).json({ error: 'Failed to create merchant' });
      }
      return res.status(201).json(merchant);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/merchants:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
