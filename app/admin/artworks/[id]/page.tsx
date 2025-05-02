"use client";

import { Suspense } from 'react';
import EditArtworkClient from './edit-artwork-client';
import { useParams } from 'next/navigation';

/**
 * Edit Artwork Page - Client Component
 * This component gets the id from the URL params and passes it to the EditArtworkClient
 */
export default function EditArtworkPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Suspense fallback={<div className="p-12 text-center">Loading artwork details...</div>}>
      <EditArtworkClient id={id} />
    </Suspense>
  );
}
