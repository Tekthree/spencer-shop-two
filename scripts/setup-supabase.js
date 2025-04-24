/**
 * Supabase Setup Script
 * 
 * This script:
 * 1. Creates an admin user for the Spencer Grey Artist Website
 * 2. Adds initial content for the About page
 * 
 * Usage:
 * node scripts/setup-supabase.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase client with service role key (required for admin operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin user details - change these as needed
const ADMIN_EMAIL = 'admin@spencergrey.com';
const ADMIN_PASSWORD = 'SpencerGrey2025!'; // You should change this immediately after first login

async function main() {
  console.log('🔄 Setting up Supabase for Spencer Grey Artist Website...');

  try {
    // Step 1: Create admin user
    console.log(`\n📝 Creating admin user (${ADMIN_EMAIL})...`);
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: { role: 'admin' }
    });

    if (adminError) {
      if (adminError.message.includes('already exists')) {
        console.log('✅ Admin user already exists');
      } else {
        throw adminError;
      }
    } else {
      console.log('✅ Admin user created successfully');
      console.log(`   User ID: ${adminUser.user.id}`);
      console.log(`   Email: ${adminUser.user.email}`);
      console.log('   ⚠️  IMPORTANT: Change the default password after first login!');
    }

    // Step 2: Add some initial content for the About page
    console.log('\n📝 Adding initial About page content...');
    
    const aboutSections = [
      {
        id: 'bio',
        page: 'about',
        title: 'Biography',
        content: 'Spencer Grey is a contemporary artist based in Seattle, Washington. His work explores the intersection of urban landscapes and natural elements, creating a unique visual language that resonates with viewers worldwide.',
        order: 0
      },
      {
        id: 'statement',
        page: 'about',
        title: 'Artist Statement',
        content: 'My work is an ongoing exploration of the spaces we inhabit—both physically and emotionally. Through limited edition prints, I aim to capture moments of quiet contemplation in our increasingly chaotic world.',
        order: 1
      },
      {
        id: 'exhibitions',
        page: 'about',
        title: 'Exhibitions',
        content: '2024 - "Urban Reflections" - Seattle Art Gallery\n2023 - "New Perspectives" - Portland Museum of Contemporary Art\n2022 - "Emerging Artists Showcase" - San Francisco',
        order: 2
      }
    ];

    const { error: contentError } = await supabase
      .from('page_content')
      .upsert(aboutSections);

    if (contentError) {
      console.error('❌ Error adding initial content:', contentError);
    } else {
      console.log('✅ Initial About page content added successfully');
    }

    console.log('\n🎉 Supabase setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Log in to the admin panel at /admin/login');
    console.log(`2. Use ${ADMIN_EMAIL} and the password you set`);
    console.log('3. Start adding artworks and managing your content');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Execute the main function
main();

// Export for module usage
export { main };
