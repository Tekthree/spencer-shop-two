# TypeScript Fixes for Spencer Grey Artist Website

This document outlines the TypeScript fixes that have been implemented in the Spencer Grey artist website project.

## Next.js 15 Build Fixes (May 2025)

### 1. Stripe API Version Update

Updated the Stripe API version in `lib/stripe/stripe-server.ts` to match the required TypeScript type:

```typescript
// Before
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// After
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Updated to latest API version
});
```

This fixed the TypeScript error: `Type '"2023-10-16"' is not assignable to type '"2025-04-30.basil"'`.

### 2. Artwork Type Definition Fix

Updated the index signature in the `images` property type definition in `types/artwork.ts` to support optional properties:

```typescript
// Before
images: ArtworkImage[] | string[] | string | { main?: string; hover?: string; [key: string]: string };

// After
images: ArtworkImage[] | string[] | string | { main?: string; hover?: string; [key: string]: string | undefined };
```

This fixed the TypeScript error: `Property 'main' of type 'string | undefined' is not assignable to 'string' index type 'string'`.

### 3. Suspense Boundary for useSearchParams()

Restructured the checkout success page to properly handle `useSearchParams()` in Next.js 15 by implementing a client-server component pattern with Suspense:

1. Created a separate client component in `app/checkout/success/client-content.tsx`:
```tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/cart-context';
// ... rest of the component
```

2. Updated the main page component in `app/checkout/success/page.tsx` to use Suspense:
```tsx
import { Suspense } from 'react';
import { ClientSuccessContent } from './client-content';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <ClientSuccessContent />
    </Suspense>
  );
}
```

This fixed the error: `useSearchParams() should be wrapped in a suspense boundary at page "/checkout/success"`.

## Admin Artwork Edit Page Fixes

### 1. Server Component with Client Component Pattern

The admin artwork edit page was converted to follow the server component pattern, where a server component wrapper passes the params to a client component:

```tsx
// Server component wrapper in page.tsx
export default function EditArtworkPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading artwork details...</div>}>
      <EditArtworkClient id={params.id} />
    </Suspense>
  );
}
```

### 2. Client Component Implementation

The client component (`edit-artwork-client.tsx`) handles all the interactive elements and state management:

```tsx
// Client component receives id as prop
export default function EditArtworkClient({ id }: { id: string }) {
  // Component implementation
}
```

## Image Type Fixes

### 1. Image Interface Updates

Updated the interface definition for images to properly support the 'main' type:

```tsx
interface Image {
  url: string;
  alt: string;
  type?: 'main' | string | undefined;
}
```

This ensures type safety when working with image objects throughout the application.

## Alternative Client-Side Approach

For pages with persistent TypeScript errors related to params, an alternative client-side approach was implemented:

```tsx
"use client";

import { useParams } from 'next/navigation';

export default function SomePage() {
  const params = useParams();
  const id = params.id as string;
  
  // Component implementation
}
```

This approach uses the `useParams` hook from Next.js to access route parameters in a type-safe way.

## Next.js Image Component Migration

Replaced standard HTML `<img>` tags with Next.js `<Image>` components for improved performance and proper type checking:

```tsx
// Before
<img src={imageUrl} alt={imageAlt} />

// After
<Image 
  src={imageUrl} 
  alt={imageAlt} 
  width={800} 
  height={600} 
  className="object-cover"
/>
```

## Form Validation with Zod

Implemented proper type validation for form inputs using Zod schemas:

```tsx
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  // Other fields
});

type FormValues = z.infer<typeof formSchema>;
```

This ensures type safety and validation for form inputs.

## Remaining Issues

Some TypeScript errors persist in dynamic route pages related to the params property. These are likely due to specific type constraints in the Next.js App Router implementation and may require further investigation.
