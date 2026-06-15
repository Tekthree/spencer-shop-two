import type { BlogContentBlock } from '@/types/blog';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function extractHeadings(blocks: BlogContentBlock[]): TocItem[] {
  const items: TocItem[] = [];

  for (const block of blocks) {
    if (block.type === 'heading') {
      const level = block.level ?? 2;
      if (level <= 3) {
        items.push({ id: slugifyHeading(block.text), text: block.text, level });
      }
    } else if (block.type === 'rich_text') {
      const matches = [...block.html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)];
      for (const m of matches) {
        const level = parseInt(m[1]);
        const raw = m[2].replace(/<[^>]+>/g, '');
        items.push({ id: slugifyHeading(raw), text: raw, level });
      }
    }
  }

  return items;
}

export function injectHeadingIds(html: string): string {
  return html
    .replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, '');
      const id = slugifyHeading(text);
      if (/id=/.test(attrs)) return `<h2${attrs}>${inner}</h2>`;
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    })
    .replace(/<h3([^>]*)>(.*?)<\/h3>/gi, (_, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, '');
      const id = slugifyHeading(text);
      if (/id=/.test(attrs)) return `<h3${attrs}>${inner}</h3>`;
      return `<h3${attrs} id="${id}">${inner}</h3>`;
    });
}
