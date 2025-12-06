import type { MatchingDebugInfo, CandidateOffer } from '../types';

interface DebugPanelProps {
  debugInfo: MatchingDebugInfo | null;
  isVisible: boolean;
  onToggle: () => void;
}

export function DebugPanel({ debugInfo, isVisible, onToggle }: DebugPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="font-medium text-gray-700">Debug Panel</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isVisible ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isVisible && debugInfo && (
        <div className="p-6 border-t border-gray-200">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Category</p>
              <p className="text-lg font-semibold text-blue-900">{debugInfo.merchantCategory}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">Eligible Offers</p>
              <p className="text-lg font-semibold text-green-900">{debugInfo.eligibleOffersCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium">Selected</p>
              <p className="text-lg font-semibold text-purple-900 truncate">{debugInfo.selectedOfferId}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-medium">Total Evaluated</p>
              <p className="text-lg font-semibold text-orange-900">{debugInfo.allCandidates.length}</p>
            </div>
          </div>

          {/* Selection Reason */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">
              Selection Reason: {debugInfo.selectionReason}
            </p>
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advertiser
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EVI
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Commission Rate">Comm %</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Click-Through Rate = Clicks / Impressions">CTR</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Conversion Rate = Sales / Impressions">Conv %</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Average Order Value">AOV</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Total Impressions">Impr</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Total Clicks">Clicks</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Total Sales">Sales</span>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span title="Skip Rate = Skips / Impressions">Skip %</span>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debugInfo.allCandidates
                  .sort((a, b) => {
                    // Sort eligible first, then by EVI
                    if (a.eligible && !b.eligible) return -1;
                    if (!a.eligible && b.eligible) return 1;
                    return b.evi - a.evi;
                  })
                  .map((candidate) => (
                    <CandidateRow
                      key={candidate.offerId}
                      candidate={candidate}
                      isSelected={candidate.offerId === debugInfo.selectedOfferId}
                    />
                  ))}
              </tbody>
            </table>
          </div>

          {/* EVI Formula */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">EVI Formula</p>
            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              EVI = commission × conversionRate × avgOrderValue
            </code>
          </div>
        </div>
      )}

      {isVisible && !debugInfo && (
        <div className="p-6 border-t border-gray-200 text-center text-gray-500">
          <p>No debug information available. Click "Get Offer" to see matching details.</p>
        </div>
      )}
    </div>
  );
}

function CandidateRow({ candidate, isSelected }: { candidate: CandidateOffer; isSelected: boolean }) {
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '-';
    return value.toLocaleString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `$${value.toFixed(0)}`;
  };

  return (
    <tr className={isSelected ? 'bg-green-50' : candidate.eligible ? '' : 'bg-gray-50'}>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center">
          {isSelected && (
            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm ${isSelected ? 'font-semibold text-green-700' : 'text-gray-900'}`}>
            {candidate.advertiserName}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono font-semibold text-blue-600">
        {candidate.evi.toFixed(4)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono">
        {formatPercent(candidate.commissionRate)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono">
        <span className={candidate.clickThroughRate && candidate.clickThroughRate > 0.15 ? 'text-green-600 font-medium' : ''}>
          {formatPercent(candidate.clickThroughRate)}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono">
        <span className={candidate.conversionRate && candidate.conversionRate > 0.05 ? 'text-green-600 font-medium' : ''}>
          {formatPercent(candidate.conversionRate)}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono">
        {formatCurrency(candidate.avgOrderValue)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-500">
        {formatNumber(candidate.totalImpressions)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-500">
        {formatNumber(candidate.totalClicks)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-500">
        {formatNumber(candidate.totalSales)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-mono">
        <span className={candidate.skipRate && candidate.skipRate > 0.25 ? 'text-red-600 font-medium' : 'text-gray-500'}>
          {formatPercent(candidate.skipRate)}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-center">
        {candidate.eligible ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Eligible
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800" title={candidate.ineligibleReason}>
            {candidate.ineligibleReason?.split(':')[0] || 'Ineligible'}
          </span>
        )}
      </td>
    </tr>
  );
}
