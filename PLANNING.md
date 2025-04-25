# Spencer Grey Artist Website Planning Document

## Project Overview
This document outlines the high-level vision, architecture, constraints, and technology stack for Spencer Grey's artist website. Inspired by Roburico.com, the website will serve as a digital gallery and e-commerce platform for selling limited edition art prints, allowing visitors to explore and purchase artwork while providing Spencer with a custom CMS to manage content.

## Core Objectives
1. Create a visually stunning, minimalist website that puts Spencer Grey's artwork front and center
2. Implement e-commerce functionality for selling limited edition art prints
3. Establish sustainability messaging through print-on-demand approach
4. Ensure responsive design and optimal performance across all devices
5. Provide a seamless user experience with subtle animations and transitions

## Business Model
- **Limited Edition Approach**: Each artwork will be limited to a specific number of prints to create scarcity and value
- **Print-on-Demand**: All prints will be made to order to minimize waste and maintain sustainability
- **Quality Focus**: Emphasize high-quality printing materials and processes
- **Optional NFT Integration**: Offer digital NFT versions of physical artworks as a complementary product

## Architecture

### Frontend
- **Framework**: Next.js (App Router)
  - Offers server-side rendering and static site generation for optimal performance
  - Built-in routing system with dynamic routes for artwork pages
  - API routes for handling backend functionality
  
- **UI Framework**: Tailwind CSS
  - Utility-first approach for clean, minimalist designs
  - Responsive out of the box
  - Easy integration with Next.js
  
- **Animation**: Framer Motion
  - Subtle animations for transitions
  - Microinteractions for enhanced user experience
  - Performance-optimized motion library

### Backend
- **Database/Authentication**: Supabase
  - PostgreSQL database for storing product, page, and user data
  - Authentication system for admin access
  - Storage buckets for artwork images and content
  - Row Level Security (RLS) policies for data protectionfor images and media assets
  - Edition tracking system for limited prints
  - Local development with Supabase CLI
  
- **Payment Processing**: Stripe
  - Secure payment processing
  - Product and inventory management
  - Checkout experience

### Deployment
- Vercel (recommended for Next.js applications)
- Connect to GitHub repository for CI/CD workflow

## Site Structure

### Public Pages
1. **Home** - Minimalist landing page featuring a curated selection of artwork with plenty of white space
2. **Shop All** - Complete collection of artwork available for purchase
3. **Collections** - Artwork organized by themed collections or series
4. **Artwork Detail** - Individual artwork page with size options, edition information, and purchase functionality
5. **About** - Artist biography and philosophy, with focus on quality and sustainability
6. **Contact** - Simple contact form

### Admin Panel

The admin panel is a custom-built CMS for Spencer to manage his artwork, collections, and website content. It includes:

- **Authentication**: Secure login system for admin access using Supabase Auth
- **Artwork Management**: Add, edit, and delete artworks with edition tracking
  - Multiple size options with separate edition limits
  - Image management with drag-and-drop upload
  - Featured artwork selection for homepage
- **About Page Editor**: Update artist biography, statement, and exhibitions
  - Rich text editing for content sections
  - Section reordering and image upload
- **Image Library**: Centralized management of all uploaded images
  - Filtering by storage bucket and search
  - Copy image URLs for reuse
  - Bulk selection and deletion
- **Dashboard**: Quick access to key sections and statistics

The admin panel follows the same clean, minimalist design as the public-facing website, with responsive layouts using Tailwind CSS.

## Data Models

### Artwork
```
{
  id: string
  title: string
  description: string
  sizesAvailable: [
    {
      size: string (e.g., "18x24")
      price: number
      editionLimit: number
      editionsSold: number
      available: boolean
    }
  ]
  medium: string
  year: number
  collectionId: string
  featured: boolean
  images: {
    main: string
    detail: string[]
  }
  hasNft: boolean
  nftLink: string (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection
```
{
  id: string
  name: string
  description: string
  featured: boolean
  coverImage: string
  order: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Order
```
{
  id: string
  customer: {
    name: string
    email: string
    address: object
  }
  items: [
    {
      artwork: reference
      size: string
      price: number
      editionNumber: number
    }
  ]
  total: number
  status: string
  paymentIntent: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Page Content
```
{
  page: string
  sections: [
    {
      id: string
      type: string (hero, text, etc.)
      content: object
      order: number
    }
  ]
  metadata: {
    title: string
    description: string
  }
  updatedAt: timestamp
}
```

## Database Schema

### Core Tables

1. **artworks**
   - id (UUID, primary key)
   - title (text)
   - description (text)
   - year (integer)
   - medium (text)
   - collection_id (UUID, foreign key)
   - featured (boolean)
   - images (jsonb array) - [{url: string, alt: string}]
   - sizes (jsonb array) - [{size: string, price: number, edition_limit: number, editions_sold: number}]
   - created_at (timestamp)

2. **collections**
   - id (UUID, primary key)
   - name (text)
   - description (text)
   - featured (boolean)
   - cover_image (text)
   - order (integer)
   - created_at (timestamp)

3. **orders**
   - id (UUID, primary key)
   - customer_info (jsonb) - {name, email, address, etc.}
   - items (jsonb array) - [{artwork_id, size, price, edition_number}]
   - total (integer) - Amount in cents
   - status (text) - 'pending', 'paid', 'shipped', etc.
   - payment_intent (text) - Stripe payment intent ID
   - created_at (timestamp)

4. **page_content**
   - id (text, primary key)
   - page (text) - e.g., 'about', 'home'
   - title (text)
   - content (text)
   - image_url (text)
   - order (integer)
   - created_at (timestamp)
   - updated_at (timestamp)

5. **auth.users** (Managed by Supabase Auth)
   - id (UUID, primary key)
   - email (text)
   - role (text)
   - created_at (timestamp)

## Supabase Integration

The project utilizes Supabase for database, authentication, and storage:

### Setup and Configuration

1. **Database Migration**
   - Created initial schema in `supabase/migrations/01_initial_schema.sql`
   - Set up tables for artworks, collections, orders, and page content
   - Implemented Row Level Security (RLS) policies for data protection
   - Created storage buckets for images with appropriate access policies

2. **Authentication**
   - Email/password authentication for admin access
   - Created admin user with service role permissions
   - Secured admin routes with authentication checks

3. **Storage**
   - Created separate buckets for different content types:
     - `artworks` - For artwork images
     - `about` - For about page content images
     - `collections` - For collection cover images
   - Implemented public read access and authenticated write access

4. **Setup Scripts**
   - Created scripts for applying migrations and setting up admin user
   - Implemented direct content setup without relying on exec_sql function
   - Added initial content for the About page

### Client Integration

1. **Supabase Client**
   - Configured in `lib/supabase/client.ts`
   - Type-safe access to Supabase services

2. **Authentication Utilities**
   - Implemented in `lib/supabase/auth.ts`
   - Functions for sign in, sign out, and session management

3. **Image Upload**
   - Created reusable `ImageUploader` component
   - Drag-and-drop functionality with preview
   - Direct upload to Supabase storage

### Benefits
- Serverless architecture with minimal backend maintenance
- Real-time data capabilities for future enhancements
- Secure authentication and authorization
- Scalable storage for artwork images
- PostgreSQL database with full SQL capabilities

## Technical Considerations

### State Management
- React Context API for global state
- SWR or React Query for server state management
- Zustand for complex state if needed

### Authentication Flow
- Supabase Authentication
- Protected routes in Next.js
- JWT token handling

### Image Handling
- Supabase Storage for image hosting
- Next.js Image component for optimization
- High-resolution images with zoom capability
- Watermarking options for preview images

### Print Fulfillment
- Integration with print-on-demand service
- Certificate of authenticity generation
- Edition number tracking

### Performance Optimization
- Code splitting and lazy loading
- Image optimization
- Static generation for non-dynamic pages
- Incremental Static Regeneration for semi-dynamic content

### SEO Considerations
- Next.js built-in head management
- Structured data for artworks
- Sitemap generation
- Meta tags optimization

## Next.js App Router Best Practices

### Handling Dynamic Route Parameters

When working with dynamic routes in the App Router, follow these guidelines to avoid common issues:

1. **Accessing params in Client Components**
   - In client components, params are provided as a Promise and must be unwrapped using React's `use()` function
   - Example implementation:
   ```tsx
   'use client';
   
   import { use } from 'react';
   
   type PageParams = {
     id: string;
   };
   
   export default function EditPage({ params }: { params: PageParams }) {
     // Properly unwrap params using React.use()
     const resolvedParams = use(params as unknown as Promise<PageParams>);
     const { id } = resolvedParams;
     
     // Rest of component...
   }
   ```

2. **Accessing params in Server Components**
   - In server components, params can be accessed directly as they're not wrapped in a Promise
   - Example implementation:
   ```tsx
   export default async function Page({ params }: { params: { id: string } }) {
     const { id } = params;
     // Rest of component...
   }
   ```

### Image Component Configuration

When using Next.js Image component with external domains like Supabase storage:

1. **Configure allowed domains in next.config.ts**
   ```typescript
   const nextConfig: NextConfig = {
     images: {
       domains: ['udanlcylpsvxqlihcppb.supabase.co'],
       remotePatterns: [
         {
           protocol: 'https',
           hostname: 'udanlcylpsvxqlihcppb.supabase.co',
           port: '',
           pathname: '/storage/v1/object/public/**',
         },
       ],
     },
   };
   ```

2. **Use the Image component with proper dimensions**
   ```tsx
   import Image from 'next/image';
   
   <Image
     src={imageUrl}
     alt={imageAlt}
     width={200}
     height={200}
     className="object-cover w-full h-full"
   />
   ```

## Development Workflow

1. **Setup Phase**
   - Repository setup
   - Next.js project initialization
   - Supabase project creation
   - Stripe account setup

2. **Core Development**
   - Database schema implementation
   - Authentication system
   - Basic page structure and routing
   - CMS foundation

3. **Feature Implementation**
   - Public pages development
   - E-commerce functionality
   - Admin interface
   - Animation and UI polish

4. **Testing & Refinement**
   - Cross-browser testing
   - Responsive design verification
   - Performance optimization
   - Security audit

5. **Deployment**
   - Production environment setup
   - Domain configuration
   - SSL setup
   - Analytics integration

## Supabase CLI & Local Development

The project will utilize Supabase CLI for local development and database migrations:

### Installation
```bash
# Using npm
npm install -g supabase

# Using Homebrew on macOS
brew install supabase/tap/supabase

# Using Windows with Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Local Development Workflow
1. Initialize Supabase project:
   ```bash
   supabase init
   ```

2. Start local Supabase services:
   ```bash
   supabase start
   ```

3. Creating database migrations:
   ```bash
   # Create a new migration
   supabase migration new create_artwork_table
   
   # Apply migrations
   supabase db reset
   ```

4. Capturing schema changes:
   ```bash
   # Generate SQL diff from changes made in Studio UI
   supabase db diff -f add_new_field
   ```

5. Working with PostgreSQL directly:
   ```bash
   # Get connection info
   supabase status
   
   # Connect via psql (PostgreSQL CLI)
   psql postgresql://postgres:postgres@localhost:54322/postgres
   ```

6. Generating TypeScript types from database schema:
   ```bash
   supabase gen types typescript --local > types/supabase.ts
   ```

### Benefits
- Version-controlled database schema
- Local development environment identical to production
- Easy migrations between development and production
- TypeScript type generation for better code quality

## Future Considerations

1. **NFT Integration**
   - Blockchain integration for digital art sales
   - NFT minting process
   - Wallet connection

2. **Marketing Tools**
   - Newsletter subscription
   - Social media integration
   - Promotional features

3. **Advanced E-commerce**
   - Discount codes
   - Bundle options
   - Framing options
   - International shipping optimization

## Maintenance Plan

- Regular security updates
- Database backups
- Performance monitoring
- Content updates
- Print fulfillment quality control

This planning document serves as the foundation for development. Refer to TASK.md for specific implementation tasks and current progress.
