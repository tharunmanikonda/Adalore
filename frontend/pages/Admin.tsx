import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Merchant, Offer } from '../types';
import {
  getMerchants,
  createMerchant,
  deleteMerchant,
  getOffers,
  createOffer,
  deleteOffer,
  getAdvertisers,
  createAdvertiser,
  deleteAdvertiser,
} from '../services/api';

const CATEGORIES = ['fitness', 'beauty', 'electronics', 'fashion', 'food', 'home'];

interface Advertiser {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<'merchants' | 'advertisers' | 'offers'>('merchants');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [showAdvertiserForm, setShowAdvertiserForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [merchantsData, advertisersData, offersData] = await Promise.all([
        getMerchants(),
        getAdvertisers(),
        getOffers(),
      ]);
      setMerchants(merchantsData);
      setAdvertisers(advertisersData);
      setOffers(offersData);
    } catch (err) {
      setError('Failed to load data from API.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Manage merchants, advertisers & offers</p>
              </div>
            </div>
            <Link
              to="/"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('merchants')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'merchants'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Merchants ({merchants.length})
          </button>
          <button
            onClick={() => setActiveTab('advertisers')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'advertisers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advertisers ({advertisers.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'offers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Offers ({offers.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'merchants' && (
              <MerchantsTab
                merchants={merchants}
                showForm={showMerchantForm}
                setShowForm={setShowMerchantForm}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'advertisers' && (
              <AdvertisersTab
                advertisers={advertisers}
                showForm={showAdvertiserForm}
                setShowForm={setShowAdvertiserForm}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'offers' && (
              <OffersTab
                offers={offers}
                advertisers={advertisers}
                showForm={showOfferForm}
                setShowForm={setShowOfferForm}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Merchants Tab Component
function MerchantsTab({
  merchants,
  showForm,
  setShowForm,
  onRefresh,
}: {
  merchants: Merchant[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState({ name: '', category: 'fitness', domain: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await createMerchant({
      name: formData.name,
      category: formData.category,
      domain: formData.domain || undefined,
      isActive: true,
    });
    setSaving(false);
    if (result) {
      setFormData({ name: '', category: 'fitness', domain: '' });
      setShowForm(false);
      onRefresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this merchant?')) return;
    await deleteMerchant(id);
    onRefresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Merchants (Hosts)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Merchant'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SportyGear"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., sportygear.com"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Merchant'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {merchants.map((merchant) => (
              <tr key={merchant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {merchant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {merchant.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {merchant.domain || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${merchant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {merchant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(merchant.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {merchants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No merchants yet. Add one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Advertisers Tab Component
function AdvertisersTab({
  advertisers,
  showForm,
  setShowForm,
  onRefresh,
}: {
  advertisers: Advertiser[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState({ name: '', category: 'fitness', logoUrl: '', websiteUrl: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await createAdvertiser({
      name: formData.name,
      category: formData.category,
      logoUrl: formData.logoUrl || undefined,
      websiteUrl: formData.websiteUrl || undefined,
    });
    setSaving(false);
    if (result) {
      setFormData({ name: '', category: 'fitness', logoUrl: '', websiteUrl: '' });
      setShowForm(false);
      onRefresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this advertiser? All associated offers will also be deleted.')) return;
    await deleteAdvertiser(id);
    onRefresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Advertisers (Brands)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Advertiser'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., FitPro Supplements"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Advertiser'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {advertisers.map((advertiser) => (
              <tr key={advertiser.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {advertiser.logo_url ? (
                    <img src={advertiser.logo_url} alt={advertiser.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      {advertiser.name.charAt(0)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {advertiser.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {advertiser.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {advertiser.website_url ? (
                    <a href={advertiser.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {new URL(advertiser.website_url).hostname}
                    </a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(advertiser.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {advertisers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No advertisers yet. Add one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Offers Tab Component
function OffersTab({
  offers,
  advertisers,
  showForm,
  setShowForm,
  onRefresh,
}: {
  offers: Offer[];
  advertisers: Advertiser[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState({
    advertiserId: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    offerUrl: '',
    commissionRate: 0.05,
    conversionRate: 0.03,
    avgOrderValue: 50,
    category: 'fitness',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.advertiserId) {
      alert('Please select an advertiser');
      return;
    }
    setSaving(true);
    const result = await createOffer({
      advertiserId: formData.advertiserId,
      title: formData.title,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      offerUrl: formData.offerUrl,
      commissionRate: formData.commissionRate,
      conversionRate: formData.conversionRate,
      avgOrderValue: formData.avgOrderValue,
      category: formData.category,
    });
    setSaving(false);
    if (result) {
      setFormData({
        advertiserId: '',
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        offerUrl: '',
        commissionRate: 0.05,
        conversionRate: 0.03,
        avgOrderValue: 50,
        category: 'fitness',
      });
      setShowForm(false);
      onRefresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    await deleteOffer(id);
    onRefresh();
  }

  // Calculate EVI
  const calculateEVI = (o: Offer) => (o.commissionRate * o.conversionRate * o.avgOrderValue).toFixed(4);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Offers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Offer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser *</label>
              <select
                required
                value={formData.advertiserId}
                onChange={(e) => {
                  const adv = advertisers.find(a => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    advertiserId: e.target.value,
                    category: adv?.category || formData.category,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select advertiser...</option>
                {advertisers.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.name} ({adv.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20% Off First Order"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short description of the offer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer URL *</label>
              <input
                type="url"
                required
                value={formData.offerUrl}
                onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (0-1)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">{(formData.commissionRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Rate (0-1)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={formData.conversionRate}
                onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">{(formData.conversionRate * 100).toFixed(2)}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Order Value ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.avgOrderValue}
                onChange={(e) => setFormData({ ...formData, avgOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Calculated EVI:</strong>{' '}
              {(formData.commissionRate * formData.conversionRate * formData.avgOrderValue).toFixed(4)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              EVI = {formData.commissionRate} × {formData.conversionRate} × ${formData.avgOrderValue}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Offer'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advertiser</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comm.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conv.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">AOV</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">EVI</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  <div>{offer.title}</div>
                  <div className="text-xs text-gray-500">{offer.discountType}: {offer.discountValue}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  {offer.advertiserName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {offer.category}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                  {(offer.commissionRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                  {(offer.conversionRate * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                  ${offer.avgOrderValue}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono font-semibold text-blue-600">
                  {calculateEVI(offer)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No offers yet. Add one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
