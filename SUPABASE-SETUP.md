# Supabase Setup for Spencer Grey Artist Website

This document provides instructions for setting up Supabase for the Spencer Grey Artist Website, including applying database migrations and creating an admin user.

## Prerequisites

Make sure you have the following:

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Your Supabase project URL and API keys added to `.env.local`
3. Node.js and npm installed

## Setup Instructions

### Option 1: Using the Shell Script (Recommended for WSL/Linux/Mac)

1. Open a terminal in your WSL environment (not Windows PowerShell)
2. Navigate to the project directory:
   ```bash
   cd /home/tekthree/spenser-portfolio-store-two/s-port
   ```
3. Make the setup script executable:
   ```bash
   chmod +x scripts/setup-supabase.sh
   ```
4. Run the setup script:
   ```bash
   ./scripts/setup-supabase.sh
   ```

This script will:
- Apply database migrations from `supabase/migrations` directory
- Create an admin user (admin@spencergrey.com with password SpencerGrey2025!)
- Add initial content for the About page

### Option 2: Manual Setup (Alternative)

If you prefer to run the steps manually or are using Windows without WSL:

1. Install required dependencies:
   ```bash
   npm install dotenv @supabase/supabase-js
   ```

2. Apply database migrations:
   ```bash
   node scripts/apply-migrations.js
   ```

3. Create the admin user and initial content:
   ```bash
   node scripts/setup-supabase.js
   ```

## Admin User Details

After setup, you can log in to the admin panel with:
- Email: `admin@spencergrey.com`
- Password: `SpencerGrey2025!`

**Important:** Change this password immediately after your first login!

## Database Schema

The setup creates the following tables:
- `artworks` - Store artwork information with edition tracking
- `collections` - Group artworks into collections
- `orders` - Customer orders with edition numbers
- `page_content` - CMS content for pages (like the About page)

It also creates storage buckets for image uploads:
- `artworks` - For artwork images
- `about` - For about page images
- `collections` - For collection cover images

## Troubleshooting

If you encounter any issues:

1. **Migration Errors**: Make sure the `exec_sql` function exists in your Supabase project. You can create it manually in the SQL Editor:
   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(query text)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     EXECUTE query;
   END;
   $$;
   ```

2. **Authentication Issues**: Verify your Supabase URL and service role key in `.env.local`

3. **Permission Errors**: Make sure you're running the scripts with appropriate permissions

For any other issues, check the Supabase documentation or contact the development team.
