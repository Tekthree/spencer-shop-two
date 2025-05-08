# TypeScript and ESLint Fixes for Spencer Grey Artist Website

This document outlines the TypeScript and ESLint fixes that have been implemented in the Spencer Grey artist website project.

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

## About Page Content Rendering Fix (May 2025)

### 1. CMS Content ID Mapping

Fixed the about page content rendering to correctly display content from the CMS by properly mapping content sections by their IDs:

```tsx
// Before - Content sections were found by title or order
const heroSection = contentSections?.find(section => section.title === 'Hero') || fallbackHero;
const artistBio = contentSections?.find(section => section.title === 'Artist Bio') || fallbackArtistBio;

// After - Content sections are found by ID first, then by title as fallback
const artistStatement = contentSections?.find(section => section.id === 'statement') || 
                       contentSections?.find(section => section.title === 'Artist Statement') || 
                       fallbackArtistStatement;
                     
const mainArtistImage = contentSections?.find(section => section.id === 'main_image') || 
                       contentSections?.find(section => section.title === 'Main Artist Image') || 
                       fallbackMainArtistImage;
```

### 2. Layout Improvements

Updated the about page layout to follow the minimalist aesthetic:

1. Changed the main artist image to be full-width like a hero banner
2. Moved the main description below the image and centered it
3. Removed paragraph titles from the display for a cleaner presentation

```tsx
// Before - Two-column layout with image and text side by side
<motion.div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
  {/* Image and text side by side */}
</motion.div>

// After - Full-width image with centered text below
<motion.div className="mb-12 w-full">
  {/* Full-width hero image */}
</motion.div>
<motion.div className="mb-16 max-w-3xl mx-auto text-center">
  {/* Centered description text */}
</motion.div>
```

### 3. Removed Debug Logging

Removed console.log statements from both client and server components to keep the browser console clean:

```tsx
// Before - Debug logging in client component
console.log('Content Sections:', contentSections);
console.log('Artist Statement Section:', contentSections?.find(section => section.id === 'statement'));

// Before - Debug logging in server component
console.log('Server Component - Content Sections:', contentSections);

// After - Clean code without debug logging
// Content sections are now properly mapped to their respective display areas
```

## UI Improvements (May 2025)

### 1. Artwork Detail Page Redesign

Redesigned the artwork detail page to match the Roburico.com example with the following improvements:

1. Changed the layout to have stacked images on the left and sticky product information on the right:
```tsx
// Before - Grid layout with thumbnails and main image
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Thumbnails and main image */}
  </div>
</div>

// After - Stacked images with sticky product info
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
  <div className="space-y-8">
    {/* Stacked full-size images */}
  </div>
  <div className="relative">
    <div ref={productInfoRef} className="sticky top-24 space-y-6">
      {/* Sticky product information */}
    </div>
  </div>
</div>
```

2. Added expandable sections for product details using disclosure components:
   - About the Piece
   - Details & Specs
   - Shipping & Returns
   - Customer Care

3. Enhanced the user experience with:
   - "JUST DROPPED" label for new releases
   - Improved size selection UI
   - More detailed product specifications
   - Share button

4. Implemented proper sticky behavior for the product information panel during scroll

5. Added responsive mobile design with horizontal image carousel:
   - Created a swipeable image carousel for mobile devices
   - Added navigation arrows and dot indicators for easy browsing
   - Maintained the stacked image layout for desktop views
   - Ensured smooth transitions between mobile and desktop layouts

This redesign improves the shopping experience by making all product images easily viewable while keeping the purchase options always accessible as the user scrolls. The mobile-optimized carousel provides a better experience on smaller screens, matching the Roburico.com example.

## ESLint and TypeScript Fixes (May 2025)

### 1. Fixed Unused Variables and Unescaped Apostrophes

Fixed several ESLint errors related to unused variables and unescaped apostrophes across multiple files:

```typescript
// Fixed unused variables in artwork-detail-client.tsx
// Before
const pageVariants = { /* ... */ };
const isRecentlyAdded = () => { /* ... */ };

// After
// Removed unused variables and converted isRecentlyAdded to a used variable
const wasRecentlyAdded = new Date(artwork.created_at) > thirtyDaysAgo;
```

```jsx
// Fixed unescaped apostrophes
// Before
Spencer Grey's work is known for its unique blend...

// After
Spencer Grey&apos;s work is known for its unique blend...
```

### 2. Fixed 'any' Type Usage

Replaced `any` types with proper TypeScript types in multiple files:

```typescript
// Before
export function productJsonLd(artwork: any) { /* ... */ }

// After
type ArtworkData = {
  id: string;
  title: string;
  description?: string;
  images?: Array<{ url: string }> | { url: string }[] | string[] | string;
  sizes?: Array<{ price: number }>;
};

export function productJsonLd(artwork: ArtworkData) { /* ... */ }
```

### 3. Fixed Client-Side Browser API Usage

Fixed issues with direct browser API access in server components:

```typescript
// Before - Direct navigator access in JSX
{navigator.share ? "SHARE" : "SHARE WITH A FRIEND"}

// After - Using state to safely handle browser APIs
const [canNativeShare, setCanNativeShare] = useState(false);

useEffect(() => {
  setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
}, []);

// In JSX
{canNativeShare ? "SHARE" : "SHARE WITH A FRIEND"}
```

### 4. Fixed OpenGraph Type Constraints

Fixed issues with OpenGraph type constraints in Next.js metadata:

```typescript
// Before
type?: 'website' | 'article' | 'product' | 'profile';

// After - Removed 'product' which is not supported by Next.js
type?: 'website' | 'article' | 'profile';
```

### 5. Fixed React Hooks Exhaustive Dependencies

Fixed React hooks exhaustive dependencies warning in the FAQ page:

```typescript
// Before - Using sectionRefs.current directly in cleanup
useEffect(() => {
  // ...
  Object.values(sectionRefs.current).forEach((el) => {
    if (el) observer.observe(el);
  });

  return () => {
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.unobserve(el);
    });
  };
}, []);

// After - Capturing the current value in a variable
useEffect(() => {
  // ...
  const currentRefs = sectionRefs.current;
  Object.values(currentRefs).forEach((el) => {
    if (el) observer.observe(el);
  });

  return () => {
    Object.values(currentRefs).forEach((el) => {
      if (el) observer.unobserve(el);
    });
  };
}, []);
```

These fixes address all the ESLint and TypeScript errors that were preventing successful builds in Next.js 15.
