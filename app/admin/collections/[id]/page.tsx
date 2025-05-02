"use client";

import { Suspense } from 'react';
import EditCollectionClient from './edit-collection-client';
import { useParams } from 'next/navigation';

/**
 * Edit Collection Page - Client Component
 * This component gets the id from the URL params and passes it to the EditCollectionClient
 */
export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Suspense fallback={<div className="p-12 text-center">Loading collection details...</div>}>
      <EditCollectionClient id={id} />
    </Suspense>
  );
}
