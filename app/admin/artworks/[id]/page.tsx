"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// Dynamically import the EditArtworkClient component with no SSR
// This helps prevent server-side module resolution issues
const EditArtworkClient = dynamic(() => import('./edit-artwork-client'), {
  ssr: false,
  loading: () => <div className="p-12 text-center">Loading artwork details...</div>
});

/**
 * Edit Artwork Page - Client Component
 * This component gets the id from the URL params and passes it to the EditArtworkClient
 */
export default function EditArtworkPage() {
  const params = useParams();
  const id = params.id as string;

  return <EditArtworkClient id={id} />;
}
