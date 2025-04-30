// Script to initialize the About page content with sample data
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initAboutPage() {
  console.log('Initializing About page content...');

  try {
    // First, delete any existing About page content
    const { error: deleteError } = await supabase
      .from('page_content')
      .delete()
      .eq('page', 'about');

    if (deleteError) {
      console.error('Error deleting existing content:', deleteError);
      return;
    }

    // Sample content for the About page
    const aboutContent = [
      {
        id: 'statement',
        title: 'Artist Statement',
        content: 'MY WORK IS AN ONGOING EXPLORATION OF THE SPACES WE INHABIT—BOTH PHYSICALLY AND EMOTIONALLY. THROUGH LIMITED EDITION PRINTS, I AIM TO CAPTURE MOMENTS OF QUIET CONTEMPLATION IN OUR INCREASINGLY CHAOTIC WORLD.',
        order: 0,
        page: 'about'
      },
      {
        id: 'main_image',
        title: 'Main Artist Image',
        content: '',
        image_url: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?q=80&w=2070&auto=format&fit=crop',
        order: 1,
        page: 'about'
      },
      {
        id: 'main_description',
        title: 'Main Description',
        content: 'From Seattle to New York, my artwork has been exhibited across the country. Each piece is meticulously printed on archival paper, ensuring rich colors and vibrant details that remain as unfaded passion, connected to fleeting moments and deeper stories.',
        order: 2,
        page: 'about'
      },
      {
        id: 'gallery_image_1',
        title: 'Gallery Image 1',
        content: '',
        image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=2065&auto=format&fit=crop',
        order: 3,
        page: 'about'
      },
      {
        id: 'gallery_image_2',
        title: 'Gallery Image 2',
        content: '',
        image_url: 'https://images.unsplash.com/photo-1576504677634-06b2130bd1f3?q=80&w=2070&auto=format&fit=crop',
        order: 4,
        page: 'about'
      },
      {
        id: 'gallery_image_3',
        title: 'Gallery Image 3',
        content: '',
        image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2070&auto=format&fit=crop',
        order: 5,
        page: 'about'
      },
      {
        id: 'secondary_description',
        title: 'Secondary Description',
        content: 'Fueled by my passion for capturing moments of tranquility, I\'ve been creating artwork for over a decade. Each piece represents a personal journey, and most of all, a chance to invite viewers to pause, observe, and be moved by the quiet spaces we often overlook.',
        order: 6,
        page: 'about'
      },
      {
        id: 'signature',
        title: 'Signature',
        content: '',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Signature_of_Thomas_Jefferson.svg',
        order: 7,
        page: 'about'
      }
    ];

    // Insert the sample content
    const { data, error } = await supabase
      .from('page_content')
      .insert(aboutContent)
      .select();

    if (error) {
      console.error('Error inserting content:', error);
      return;
    }

    console.log('Successfully initialized About page content:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the initialization function
initAboutPage().catch(console.error);
