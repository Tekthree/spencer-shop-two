export type BlogContentBlock =
  | { type: 'heading'; level?: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt: string; caption?: string }
  | { type: 'quote'; text: string; attribution?: string };

export type BlogStatus = 'draft' | 'published' | 'scheduled';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  cover_image?: string;
  cover_image_alt?: string;
  author_name: string;
  author_role?: string;
  read_time_minutes?: number;
  status: BlogStatus;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  content: BlogContentBlock[];
}
