import { Suspense } from 'react';
import { Metadata } from 'next';
import { ClientSuccessContent } from './client-content';

/**
 * Checkout Success Page
 * Displayed after a successful payment
 */
export const metadata: Metadata = {
  title: 'Order Confirmation | Spencer Grey',
  description: 'Thank you for your order of limited edition art prints by Spencer Grey.',
};

// Loading UI component
function LoadingUI() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="h-32 bg-gray-200 rounded mb-8"></div>
      </div>
    </div>
  );
}

/**
 * Server component that wraps the client component with Suspense
 * This fixes the Next.js 15 issue with useSearchParams() needing to be in a Suspense boundary
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <ClientSuccessContent />
    </Suspense>
  );
}
