"use client";

import { Suspense } from 'react';
import OrderDetailClient from './order-detail-client';
import { useParams } from 'next/navigation';

/**
 * Admin Order Detail Page - Client Component
 * This component gets the id from the URL params and passes it to the OrderDetailClient
 */
export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Suspense fallback={<div className="p-12 text-center">Loading order details...</div>}>
      <OrderDetailClient id={id} />
    </Suspense>
  );
}
