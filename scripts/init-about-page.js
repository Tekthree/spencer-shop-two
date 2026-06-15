// Initialize About page content with sample data
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

const aboutContent = [
  {
    id: 'statement',
    title: 'Artist Statement',
    content: 'MY WORK IS AN ONGOING EXPLORATION OF THE SPACES WE INHABIT—BOTH PHYSICALLY AND EMOTIONALLY. THROUGH LIMITED EDITION PRINTS, I AIM TO CAPTURE MOMENTS OF QUIET CONTEMPLATION IN OUR INCREASINGLY CHAOTIC WORLD.',
    image_url: null,
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
    image_url: null,
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
    content: "Fueled by my passion for capturing moments of tranquility, I've been creating artwork for over a decade. Each piece represents a personal journey, and most of all, a chance to invite viewers to pause, observe, and be moved by the quiet spaces we often overlook.",
    image_url: null,
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

async function initAboutPage() {
  console.log('Initializing About page content...');

  try {
    await sql`DELETE FROM page_content WHERE page = 'about'`;

    for (const row of aboutContent) {
      await sql`
        INSERT INTO page_content (id, page, title, content, image_url, "order")
        VALUES (${row.id}, ${row.page}, ${row.title}, ${row.content}, ${row.image_url}, ${row.order})
      `;
    }

    console.log('Successfully initialized About page content.');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

initAboutPage().catch(console.error);
