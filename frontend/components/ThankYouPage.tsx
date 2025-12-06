interface ThankYouPageProps {
  merchantName: string;
  orderValue: number;
  children: React.ReactNode;
}

export function ThankYouPage({ merchantName, orderValue, children }: ThankYouPageProps) {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white rounded-lg shadow-lg overflow-hidden">
      {/* Order Confirmation Header */}
      <div className="bg-green-600 px-6 py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Thank You for Your Order!</h1>
        <p className="text-green-100">Your order has been confirmed</p>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Purchased from</p>
            <p className="font-semibold text-gray-900">{merchantName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Order Total</p>
            <p className="font-semibold text-gray-900">${orderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Offer Section */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
