import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getMerchants,
  createMerchant,
  deleteMerchant,
  updateMerchant,
  getAdvertisers,
  createAdvertiser,
  deleteAdvertiser,
  getOffers,
  getActiveOffers,
  createOffer,
  deleteOffer,
  updateOffer,
  recordImpression,
  recordClick,
  recordSkip,
  recordSale,
} from './backend/services/database';

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// ============================================================================
// MERCHANT ROUTES
// ============================================================================

app.get('/api/merchants', async (_req, res) => {
  try {
    const merchants = await getMerchants();
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});

app.post('/api/merchants', async (req, res) => {
  try {
    const { name, category, domain } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    const merchant = await createMerchant({ name, category, domain, isActive: true });
    if (!merchant) {
      return res.status(500).json({ error: 'Failed to create merchant' });
    }
    res.status(201).json(merchant);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: 'Failed to create merchant' });
  }
});

app.delete('/api/merchants/:id', async (req, res) => {
  try {
    const success = await deleteMerchant(req.params.id);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete merchant' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    res.status(500).json({ error: 'Failed to delete merchant' });
  }
});

app.patch('/api/merchants/:id', async (req, res) => {
  try {
    const success = await updateMerchant(req.params.id, req.body);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update merchant' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: 'Failed to update merchant' });
  }
});

// ============================================================================
// ADVERTISER ROUTES
// ============================================================================

app.get('/api/advertisers', async (_req, res) => {
  try {
    const advertisers = await getAdvertisers();
    res.json(advertisers);
  } catch (error) {
    console.error('Error fetching advertisers:', error);
    res.status(500).json({ error: 'Failed to fetch advertisers' });
  }
});

app.post('/api/advertisers', async (req, res) => {
  try {
    const { name, category, logoUrl, websiteUrl } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    const advertiser = await createAdvertiser({ name, category, logoUrl, websiteUrl });
    if (!advertiser) {
      return res.status(500).json({ error: 'Failed to create advertiser' });
    }
    res.status(201).json(advertiser);
  } catch (error) {
    console.error('Error creating advertiser:', error);
    res.status(500).json({ error: 'Failed to create advertiser' });
  }
});

app.delete('/api/advertisers/:id', async (req, res) => {
  try {
    const success = await deleteAdvertiser(req.params.id);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete advertiser' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting advertiser:', error);
    res.status(500).json({ error: 'Failed to delete advertiser' });
  }
});

// ============================================================================
// OFFER ROUTES
// ============================================================================

app.get('/api/offers', async (req, res) => {
  try {
    const { active } = req.query;
    const offers = active === 'true' ? await getActiveOffers() : await getOffers();
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const {
      advertiserId,
      title,
      description,
      discountType,
      discountValue,
      offerUrl,
      commissionRate,
      conversionRate,
      avgOrderValue,
      category,
    } = req.body;

    if (!advertiserId || !title || !discountType || !offerUrl || !category) {
      return res.status(400).json({
        error: 'Required fields: advertiserId, title, discountType, offerUrl, category',
      });
    }

    const offer = await createOffer({
      advertiserId,
      title,
      description,
      discountType,
      discountValue: discountValue || 0,
      offerUrl,
      commissionRate: commissionRate || 0.05,
      conversionRate: conversionRate || 0.03,
      avgOrderValue: avgOrderValue || 50,
      category,
    });

    if (!offer) {
      return res.status(500).json({ error: 'Failed to create offer' });
    }
    res.status(201).json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    const success = await deleteOffer(req.params.id);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete offer' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

app.patch('/api/offers/:id', async (req, res) => {
  try {
    const success = await updateOffer(req.params.id, req.body);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update offer' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// ============================================================================
// TRACKING ROUTES
// ============================================================================

app.post('/api/track/impression', async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }
    const success = await recordImpression(offerId);
    res.json({ success });
  } catch (error) {
    console.error('Error recording impression:', error);
    res.status(500).json({ error: 'Failed to record impression' });
  }
});

app.post('/api/track/click', async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }
    const success = await recordClick(offerId);
    res.json({ success });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

app.post('/api/track/skip', async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }
    const success = await recordSkip(offerId);
    res.json({ success });
  } catch (error) {
    console.error('Error recording skip:', error);
    res.status(500).json({ error: 'Failed to record skip' });
  }
});

app.post('/api/track/sale', async (req, res) => {
  try {
    const { offerId, amount } = req.body;
    if (!offerId || amount === undefined) {
      return res.status(400).json({ error: 'offerId and amount are required' });
    }
    const success = await recordSale(offerId, amount);
    res.json({ success });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
