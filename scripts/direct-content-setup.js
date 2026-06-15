// Direct content setup for Spencer Grey Artist Website
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

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

async function main() {
  console.log('Setting up content for Spencer Grey Artist Website...');

  try {
    for (const section of aboutSections) {
      await sql`
        INSERT INTO page_content (id, page, title, content, "order")
        VALUES (${section.id}, ${section.page}, ${section.title}, ${section.content}, ${section.order})
        ON CONFLICT (id) DO UPDATE SET
          page = EXCLUDED.page,
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          "order" = EXCLUDED."order",
          updated_at = now()
      `;
    }
    console.log('Content upserted successfully.');
    console.log('\nYou can now:');
    console.log('1. Log in to the admin panel at /admin/login');
    console.log('2. Start adding artworks and managing content');
  } catch (error) {
    console.error('Script error:', error);
  }
}

main();
