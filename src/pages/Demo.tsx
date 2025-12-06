import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MerchantSelector } from '../components/MerchantSelector';
import { OfferCard } from '../components/OfferCard';
import { DebugPanel } from '../components/DebugPanel';
import { ThankYouPage } from '../components/ThankYouPage';
import { TrackingStatus } from '../components/TrackingStatus';
import type { TrackingEvent } from '../components/TrackingStatus';
import type { GetOfferResponse, MatchingDebugInfo, Merchant, Offer } from '../types';
import { selectNextOffer } from '../services/matchingEngine';
import { getMerchants, getActiveOffers } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { merchants as mockMerchants, offers as mockOffers } from '../data/mockData';

export function Demo() {
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [orderValue, setOrderValue] = useState(60);
  const [currentOffer, setCurrentOffer] = useState<GetOfferResponse | null>(null);
  const [debugInfo, setDebugInfo] = useState<MatchingDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const [usingDatabase, setUsingDatabase] = useState(false);

  // Load data from Supabase or use mock data
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        const [dbMerchants, dbOffers] = await Promise.all([
          getMerchants(),
          getActiveOffers(),
        ]);

        if (dbMerchants.length > 0 && dbOffers.length > 0) {
          setMerchants(dbMerchants);
          setOffers(dbOffers);
          setSelectedMerchantId(dbMerchants[0].id);
          setUsingDatabase(true);
        } else {
          // Fallback to mock data if DB is empty
          setSelectedMerchantId(mockMerchants[0].id);
        }
      } else {
        setSelectedMerchantId(mockMerchants[0].id);
      }
      setIsInitialLoading(false);
    }
    loadData();
  }, []);

  const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

  const handleGetOffer = useCallback(async () => {
    if (!selectedMerchant) return;

    setIsLoading(true);
    setImpressionRecorded(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const result = selectNextOffer(offers, selectedMerchant, undefined, true);

      if (result) {
        setCurrentOffer(result);
        setDebugInfo(result.debug || null);

        setTrackingEvents(prev => [
          {
            type: 'impression',
            offerId: result.offerId,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setImpressionRecorded(true);
      } else {
        setCurrentOffer(null);
        setDebugInfo(null);
      }
    } catch (error) {
      console.error('Error fetching offer:', error);
      setCurrentOffer(null);
      setDebugInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMerchant, offers]);

  const handleClaim = useCallback(() => {
    if (!currentOffer) return;

    setTrackingEvents(prev => [
      {
        type: 'click',
        offerId: currentOffer.offerId,
        timestamp: new Date(),
      },
      ...prev,
    ]);

    alert(`Redirecting to: ${currentOffer.offer.offerUrl}\n\nIn production, this would open the advertiser's landing page.`);
  }, [currentOffer]);

  const handleSkip = useCallback(() => {
    if (!currentOffer) return;

    setTrackingEvents(prev => [
      {
        type: 'skip',
        offerId: currentOffer.offerId,
        timestamp: new Date(),
      },
      ...prev,
    ]);

    setCurrentOffer(null);
    setDebugInfo(null);
    setImpressionRecorded(false);
  }, [currentOffer]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adalore</h1>
                <p className="text-xs text-gray-500">Post-Purchase Offer Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {usingDatabase && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Using Database
                </span>
              )}
              <Link
                to="/admin"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Admin Panel →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Demo: Shopify Thank-You Page Offer</h2>
          <p className="text-gray-600">
            This demo simulates how Adalore's matching engine selects offers for Shopify merchants.
            Select a merchant, enter an order value, and click "Get Offer" to see the matching logic in action.
          </p>
        </div>

        {/* Merchant Selector */}
        <MerchantSelector
          merchants={merchants}
          selectedMerchantId={selectedMerchantId}
          onSelect={setSelectedMerchantId}
          orderValue={orderValue}
          onOrderValueChange={setOrderValue}
          onGetOffer={handleGetOffer}
          isLoading={isLoading}
        />

        {/* Thank You Page Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ThankYouPage
              merchantName={selectedMerchant?.name || 'Unknown Store'}
              orderValue={orderValue}
            >
              <OfferCard
                offer={currentOffer}
                onClaim={handleClaim}
                onSkip={handleSkip}
                impressionRecorded={impressionRecorded}
              />
            </ThankYouPage>

            {trackingEvents.length > 0 && (
              <TrackingStatus events={trackingEvents.slice(0, 5)} />
            )}
          </div>

          <div>
            <DebugPanel
              debugInfo={debugInfo}
              isVisible={true}
              onToggle={() => {}}
            />
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">API Endpoint</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-green-400 text-sm">
              GET /api/offer/next?merchantId={selectedMerchantId}&orderValue={orderValue}&debug=true
            </code>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            This endpoint returns the best matching offer for the specified merchant based on category matching,
            EVI (Expected Value Index) ranking, and fair rotation rules.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            Adalore Take-Home Challenge • Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Demo;
