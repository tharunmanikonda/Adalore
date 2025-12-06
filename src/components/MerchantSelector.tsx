import type { Merchant } from '../types';

interface MerchantSelectorProps {
  merchants: Merchant[];
  selectedMerchantId: string;
  onSelect: (merchantId: string) => void;
  orderValue: number;
  onOrderValueChange: (value: number) => void;
  onGetOffer: () => void;
  isLoading: boolean;
}

export function MerchantSelector({
  merchants,
  selectedMerchantId,
  onSelect,
  orderValue,
  onOrderValueChange,
  onGetOffer,
  isLoading,
}: MerchantSelectorProps) {
  const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Simulate Thank-You Page</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Merchant Selector */}
        <div>
          <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
            Merchant (Host)
          </label>
          <select
            id="merchant"
            value={selectedMerchantId}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name} ({merchant.category})
              </option>
            ))}
          </select>
        </div>

        {/* Order Value */}
        <div>
          <label htmlFor="orderValue" className="block text-sm font-medium text-gray-700 mb-1">
            Order Value ($)
          </label>
          <input
            id="orderValue"
            type="number"
            min="0"
            step="10"
            value={orderValue}
            onChange={(e) => onOrderValueChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Get Offer Button */}
        <div className="flex items-end">
          <button
            onClick={onGetOffer}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Get Offer'
            )}
          </button>
        </div>
      </div>

      {/* Selected Merchant Info */}
      {selectedMerchant && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Selected:</span> {selectedMerchant.name} •
            <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded text-xs uppercase">{selectedMerchant.category}</span>
          </p>
        </div>
      )}
    </div>
  );
}
