// Fix page_content table and add initial content
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
  console.log('Checking and fixing page_content table...');

  try {
    // Verify table exists
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'page_content'
    `;

    if (tables.length === 0) {
      console.error('page_content table does not exist. Run apply-migrations.js first.');
      process.exit(1);
    }

    console.log('page_content table found. Adding initial About page content...');

    // Clear existing about content then insert fresh
    await sql`DELETE FROM page_content WHERE page = 'about'`;

    for (const section of aboutSections) {
      await sql`
        INSERT INTO page_content (id, page, title, content, "order")
        VALUES (${section.id}, ${section.page}, ${section.title}, ${section.content}, ${section.order})
      `;
    }

    console.log('Initial About page content added successfully.');
  } catch (error) {
    console.error('Script error:', error);
  }
}

main();
