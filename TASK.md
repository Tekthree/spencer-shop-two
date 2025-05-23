# Spencer Grey Artist Website Tasks

## Current Tasks
- [ ] Redesign artwork detail page to match Roburico.com example (2025-05-08)
  - [ ] Implement stacked images on the left side
  - [ ] Create sticky product information panel on the right
  - [ ] Add expandable sections for artwork details
  - [ ] Improve size selection UI
  - [ ] Add "JUST DROPPED" label for new releases

- [x] Fix ESLint and TypeScript build errors (2025-05-08)
  - [x] Fix unused variables in artwork-detail-client.tsx, default-json-ld.tsx, and seo-head.tsx
  - [x] Fix unescaped apostrophes in artwork-detail-client.tsx and faq/page.tsx
  - [x] Replace 'any' types with proper TypeScript types in metadata.ts, json-ld.tsx, and schema.ts
  - [x] Fix React hooks exhaustive dependencies warning in faq/page.tsx
  - [x] Fix client-side browser API usage in social-share.tsx
  - [x] Fix OpenGraph type constraints in meta-tags.ts

## Project Setup Phase

### Environment Setup
- [x] Create GitHub repository
- [x] Setup development environment with Node.js and npm
- [x] Initialize Next.js project with TypeScript
  ```bash
  npx create-next-app@latest . --typescript --app
  ```
- [ ] Configure VSCode settings and extensions
- [x] Setup ESLint and Prettier for code quality
- [x] Create a .env.local file with environment variables

### Dependency Installation
- [x] Install core dependencies:
  ```bash
  npm install @supabase/supabase-js @stripe/stripe-js @stripe/react-stripe-js zod
  ```
- [x] Setup Tailwind CSS for minimal aesthetic:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [x] Install development dependencies:
  ```bash
  npm install -D eslint prettier eslint-config-next eslint-plugin-jsdoc
  ```
- [x] Install additional UI dependencies:
  ```bash
  npm install framer-motion react-hook-form @hookform/resolvers uuid @types/uuid
  ```

### Project Structure Setup
- [x] Organize folder structure:
  - `/app` - Next.js app router routes
  - `/components` - Reusable UI components
  - `/lib` - Utility functions and constants
  - `/public` - Static assets
  - `/styles` - Global styles (included in `/app/globals.css`)
  - `/types` - TypeScript type definitions
  - `/hooks` - Custom React hooks
  - `/supabase` - Database migrations and types

### Supabase Setup
- [x] Create Supabase project
- [x] Install Supabase CLI:
  ```bash
  npm install -g supabase
  ```
- [ ] Initialize local Supabase development environment:
  ```bash
  supabase init
  supabase start
  ```
- [x] Configure authentication (email/password)
- [x] Create initial database migration files:
  ```bash
  supabase migration new initial_schema
  ```
- [x] Set up database tables:
  - `artworks` - Store artwork information with edition tracking
  - `collections` - Group artworks into collections
  - `orders` - Customer orders with edition numbers
  - `page_content` - CMS content for pages
- [x] Create storage buckets for image uploads (`artworks`, `about`, `collections`)
- [x] Set up Row Level Security (RLS) policies
- [x] Create admin user for the admin panel
- [x] Add initial content for the About page
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure storage buckets for high-resolution artwork images
- [ ] Generate TypeScript types from database schema:
  ```bash
  supabase gen types typescript --local > types/supabase.ts
  ```

### Stripe Setup
- [x] Create Stripe account
- [x] Configure Stripe products/prices structure for variable print sizes
- [x] Set up webhook endpoints
- [x] Implement edition tracking in purchase process
- [x] Generate and store API keys securely
- [x] Update Stripe API version to '2025-04-30.basil' for Next.js 15 compatibility

## Core Development Phase

### Authentication System
- [x] Create login page for admin
- [x] Implement Supabase authentication hooks
- [x] Set up protected routes for admin section
- [ ] Create authentication context provider
- [ ] Implement session persistence and refresh

### Database Schema Implementation
- [x] Define and create Supabase tables through migrations
- [ ] Create database seed data for testing
- [x] Implement edition tracking system
- [x] Set up relationship between artworks and collections
- [ ] Implement database access functions in API
- [ ] Create SQL functions for edition management
- [ ] Test schema with Supabase CLI

### Print Fulfillment System
- [ ] Research print-on-demand partners
- [ ] Create integration with selected print service
- [ ] Develop certificate of authenticity generation
- [ ] Set up automated fulfillment process
- [ ] Create shipping and tracking integration

### Public Pages (Basic Structure)
- [x] Implement core pages:
  - [x] Home page
  - [ ] Shop page (all artworks with collection filtering)
  - [x] Artwork detail page
  - [x] About page
  - [x] Contact page
- [ ] Build detailed artwork view with size selection and edition info
- [x] Implement about page focusing on quality and sustainability
- [x] Set up contact page with form validation and responsive design
- [x] Create FAQ page with accordion sections and sticky navigation

### UI Components
- [ ] Design and implement core UI components:
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Modal
  - [ ] Dropdown
  - [ ] Toggle
  - [ ] Tabs
- [x] Create layout components:
  - [x] Header
  - [x] Footer
  - [x] Sidebar (admin)
  - [x] Container

### Admin Interface Foundation
- [x] Create admin dashboard layout
- [x] Implement sidebar navigation
- [ ] Design reusable admin UI components
- [x] Create protected admin routes
- [ ] Build artwork management system
- [ ] Implement edition tracking dashboard

## Feature Implementation Phase

### Home Page Development
- [x] Implement minimalist hero section with featured artwork
- [ ] Create clean, grid-based artwork showcase
- [ ] Design quality and sustainability messaging
- [ ] Implement subtle scroll animations
- [ ] Add featured collections section

### Shop & Collection Pages Development
- [ ] Create filterable gallery grid with minimal UI
- [ ] Implement collection filtering
- [ ] Add hover effects for artwork preview
- [ ] Create loading states with skeleton placeholders
- [ ] Implement infinite scroll or simple pagination

### Artwork Detail Page
- [x] Design detailed artwork view with high-resolution images
- [ ] Implement image zoom functionality
- [x] Create size selection interface with edition information
- [x] Add "Add to Cart" functionality
- [x] Implement edition number selection/assignment
- [x] Create related artwork suggestions
- [x] Add sustainability and quality messaging

### E-commerce Functionality
- [x] Create shopping cart context and minimal UI
  - [x] Implement cart drawer that slides in from the right
  - [x] Add cart icon with item count in header
  - [x] Create cart context with localStorage persistence
  - [x] Add darkening overlay with 30% opacity when cart is open
  - [x] Implement scroll locking for background content when cart is open
  - [x] Implement add to cart functionality on artwork detail page
  - [x] Add basic checkout page structure
- [x] Implement Stripe checkout process
  - [x] Create checkout API endpoint
  - [x] Handle Stripe session creation
  - [x] Process webhook events
- [x] Build edition tracking system
- [x] Set up order confirmation pages with certificate preview
- [x] Create order history for customers
- [x] Implement inventory/edition management logic
- [ ] Add email notifications for orders

### Next.js 15 Compatibility Fixes
- [x] Fix TypeScript errors in dynamic route pages
  - [x] Convert server components to client components using useParams hook
  - [x] Implement proper Suspense boundaries for client-side navigation hooks
- [x] Update type definitions for artwork images
- [x] Fix Stripe API version compatibility

### CMS Implementation
- [ ] Create artwork management interface
- [x] Implement collection management
- [ ] Build simple page content editor
- [ ] Create high-resolution image upload interface
- [ ] Implement edition tracking dashboard
- [ ] Build sales statistics visualization

## Database Migration Management
- [ ] Create migration workflow documentation
- [ ] Set up script for generating new migrations:
  ```bash
  supabase db diff -f my_schema_change
  ```
- [ ] Implement version control integration for migrations
- [ ] Create process for applying migrations in development and production
- [ ] Set up database backup procedure before applying migrations

## Animation and UI Polish
- [ ] Implement subtle page transitions with Framer Motion
- [ ] Add scroll-based reveal animations
- [ ] Create microinteractions for buttons and UI elements
- [ ] Optimize animations for performance
- [ ] Ensure accessible motion preferences

## Testing and Refinement
- [ ] Perform cross-browser testing
- [ ] Verify responsive design on all devices
- [ ] Conduct performance audits
- [ ] Test checkout process end-to-end
- [ ] Perform accessibility audit and fixes
- [ ] Security testing for admin interface
- [ ] Test edition tracking system integrity

## Deployment Preparation
- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Link Supabase project to production:
  ```bash
  supabase link --project-ref <project-id>
  ```
- [ ] Push local migrations to production:
  ```bash
  supabase db push
  ```
- [ ] Set up CI/CD pipeline with GitHub
- [ ] Implement SEO optimization
- [ ] Create robots.txt and sitemap
- [ ] Configure analytics

## Launch Tasks
- [ ] Final QA testing
- [ ] Content review
- [ ] Performance optimization
- [ ] DNS configuration
- [ ] SSL setup
- [ ] Launch checklist verification
- [ ] Post-launch monitoring

## Backlog (Future Considerations)
- [ ] NFT integration for digital ownership
- [ ] Newsletter integration for marketing
- [ ] Discount code system for promotions
- [ ] Framing options for prints
- [ ] Print preview in different room settings
- [ ] Customer gallery for social proof
- [ ] Multi-language support

## Current Sprint Focus
- [x] Project setup and environment configuration
- [x] Basic page structure implementation
- [x] Initial Supabase and Next.js integration
- [x] Admin panel implementation
- [ ] Supabase CLI setup and local development workflow
- [x] Edition tracking system implementation
- [x] Collections management system implementation
- [x] Artwork detail page implementation with scrollable images and sticky product info
- [x] Enhanced image upload system with multiple file support and image type designation

## Discovered During Work
- [x] Fix Tailwind CSS initialization issue
- [x] Resolve Supabase CLI permission issues
- [x] Create initial lib/supabase client files
- [x] Fix About page image issues in the "Shop the art prints" section
- [x] Create initial lib/stripe client files
- [x] Scaffold basic component structure
- [x] Create database migration files for core tables
- [x] Refine home page design to match Roburico.com aesthetic
- [x] Add "use client" directive to components using client-side hooks
- [x] Implement three-column value proposition section
- [x] Create artist statement and quote sections
- [x] Create admin panel with sections for artworks, about page, and image library
- [x] Implement image uploader component for artwork management
- [x] Create scripts for applying migrations and setting up admin user
- [x] Fix dependency issues with uuid package for image uploader
- [x] Create direct content setup script for Supabase without relying on exec_sql function
- [x] Create collections listing page with management options
- [x] Implement new collection creation functionality
- [x] Build edit collection page with image upload capability
- [x] Fix image upload in collections edit page
- [x] Create artwork detail page with scrollable images and sticky product information
- [x] Implement related artworks component for artwork detail page
- [x] Implement hover image functionality for product cards in "You may also like" section
- [x] Create "Shop All Art" page with grid layout and hover image functionality
- [x] Enhance ImageUploader component to support multiple image uploads
- [x] Implement main/hover image type designation in artwork management
- [x] Fix runtime errors in image uploader component

## Deployment and Optimization
- [x] Fixed ESLint error in About page preventing Vercel deployment (unused interface warning)
- [ ] Configure environment variables in Vercel project settings:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
  - Stripe-related environment variables
- [ ] Set up proper error handling for missing environment variables
- [ ] Implement health check endpoint to verify API connectivity
- [ ] Add deployment documentation to README.md

## Notes and Decisions
- Using Next.js App Router for improved performance and newer features
- Implementing a custom CMS rather than using a headless CMS to maintain full control
- Clean, minimalist design inspired by Roburico.com that puts artwork first
- Limited edition approach to create scarcity and value
- Mobile-first approach to ensure optimal experience on all devices
- Using Supabase for authentication, database, and storage
- Admin panel organized into three main sections: Art Prints, About Page, and Image Library
- Created scripts for easier Supabase setup and migration
- Implemented edition tracking system for limited prints with size options
- Designed artwork detail page with scrollable images on the left and sticky product information on the right for optimal user experience
- Enhanced image management with main/hover image type designation for product cards
- Implemented batch image upload functionality for more efficient artwork management
- Fixed image display issues in the About page "Shop the art prints" section by properly formatting image objects with main/hover types
- Improved About page layout with 4-column grid for featured artworks
- Removed unnecessary borders and tags from product cards on the About page
- Fixed About page content rendering to correctly display Artist Statement, Main Artist Image, and Main Description from the CMS
- Updated About page layout to use a full-width hero banner for the main artist image with centered description below it
- Removed paragraph titles from About page for cleaner presentation
- Fixed TypeScript ESLint error in About page by changing unused interface to a type and updating return type annotations
- Fixed multiple ESLint and TypeScript errors across the codebase to ensure successful builds in Next.js 15
