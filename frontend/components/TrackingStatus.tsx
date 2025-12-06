import type { TrackingEvent } from '../types';

interface TrackingStatusProps {
  events: TrackingEvent[];
}

export function TrackingStatus({ events }: TrackingStatusProps) {
  if (events.length === 0) {
    return null;
  }

  const getEventIcon = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'impression':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      case 'click':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        );
      case 'skip':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
        );
    }
  };

  const getEventLabel = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'impression':
        return 'Impression Recorded';
      case 'click':
        return 'Click Tracked';
      case 'skip':
        return 'Offer Skipped';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Tracking Events (Demo)
      </h3>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {getEventIcon(event.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{getEventLabel(event.type)}</p>
              <p className="text-xs text-gray-500">Offer: {event.offerId}</p>
            </div>
            <p className="text-xs text-gray-400">
              {event.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        In production, these events would be sent to the tracking API
      </p>
    </div>
  );
}

