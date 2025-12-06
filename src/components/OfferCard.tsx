import type { GetOfferResponse } from '../types';
import { advertisers } from '../data/mockData';

interface OfferCardProps {
  offer: GetOfferResponse | null;
  onClaim: () => void;
  onSkip: () => void;
  impressionRecorded: boolean;
}

export function OfferCard({ offer, onClaim, onSkip, impressionRecorded }: OfferCardProps) {
  if (!offer) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500">Select a merchant and click "Get Offer" to see a matched offer</p>
      </div>
    );
  }

  const advertiser = advertisers.find(a => a.name === offer.advertiser);

  const getDiscountText = () => {
    switch (offer.offer.discountType) {
      case 'percentage':
        return `${offer.offer.discountValue}% OFF`;
      case 'fixed_amount':
        return `$${offer.offer.discountValue} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'SPECIAL OFFER';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">Special Offer For You</span>
          {impressionRecorded && (
            <span className="text-xs text-blue-200 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Impression recorded
            </span>
          )}
        </div>
      </div>

      {/* Offer Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Advertiser Logo */}
          <div className="flex-shrink-0">
            {advertiser?.logoUrl ? (
              <img
                src={advertiser.logoUrl}
                alt={offer.advertiser}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {offer.advertiser.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Offer Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                {getDiscountText()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{offer.offer.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{offer.advertiser}</p>
            {offer.offer.description && (
              <p className="text-sm text-gray-600 mt-2">{offer.offer.description}</p>
            )}
          </div>
        </div>

        {/* EVI Score Badge */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Match Score: <span className="font-semibold text-gray-700">{offer.score.toFixed(4)}</span>
          </span>
          <span className="text-xs text-gray-400">Offer ID: {offer.offerId}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClaim}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Claim Offer
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
