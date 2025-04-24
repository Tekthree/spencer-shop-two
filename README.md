# Spencer Grey Artist Website

![Spencer Grey Artist Website](https://via.placeholder.com/1200x630/f5f5f5/333333?text=Spencer+Grey+Artist+Website)

A minimalist, gallery-inspired website for artist Spencer Grey to showcase and sell limited edition art prints. Built with Next.js, Tailwind CSS, Supabase, and Stripe.

## Features

### Public-Facing Website
- Clean, minimalist design
- Gallery-style artwork presentation
- Limited edition print purchasing
- Artist biography and statement
- Responsive design for all devices

### Admin Panel
- Secure authentication system
- Artwork management with edition tracking
- About page content editor
- Image library for centralized media management
- Dashboard with quick access to key sections

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** with Zod for validation

### Backend
- **Supabase** for database, authentication, and storage
- **PostgreSQL** for relational data
- **Stripe** for payment processing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payment processing)

### Environment Setup
1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your environment variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Supabase Setup
1. Run the Supabase setup script to create tables and admin user:
   ```bash
   # In WSL terminal
   cd /path/to/project
   node scripts/direct-content-setup.js
   ```

2. Log in to the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) 

3. Change the default password immediately after first login.

## Project Structure

```
├── app/                 # Next.js App Router routes
│   ├── admin/           # Admin panel routes
│   ├── api/             # API routes
│   └── (site)/          # Public-facing website routes
├── components/          # React components
│   ├── admin/           # Admin-specific components
│   ├── layout/          # Layout components (header, footer)
│   └── ui/              # Reusable UI components
├── lib/                 # Utility functions and services
│   ├── supabase/        # Supabase client and utilities
│   └── stripe/          # Stripe integration
├── public/              # Static assets
├── scripts/             # Setup and utility scripts
├── supabase/            # Supabase migrations and types
│   └── migrations/      # Database migration files
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Database Schema

The project uses the following core tables:

- **artworks** - Artwork information with edition tracking
- **collections** - Groups of artworks
- **orders** - Customer orders with edition numbers
- **page_content** - CMS content for pages like About

See `supabase/migrations/01_initial_schema.sql` for the complete schema.

## Documentation

- **PLANNING.md** - Project overview, architecture, and technical decisions
- **TASK.md** - Task list and progress tracking
- **SUPABASE-SETUP.md** - Detailed Supabase setup instructions

## License

This project is private and not licensed for public use.

## Acknowledgements

- Design inspiration from [Roburico.com](https://roburico.com)
- Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Supabase](https://supabase.com), and [Stripe](https://stripe.com)
