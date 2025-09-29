"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

import ImageUploader from '@/components/admin/image-uploader';
import ImageLibraryPickerModal from '@/components/admin/image-library-picker-modal';
import type { StorageImage } from '@/lib/supabase/storage';
import type { BlogContentBlock } from '@/types/blog';

interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  author_name: string | null;
  author_role: string | null;
  read_time_minutes: number | null;
  status: string | null;
  published_at: string | null;
  content: BlogContentBlock[] | string | null;
  content_form: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

type BlogStatus = 'draft' | 'published' | 'scheduled';

type FormState = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  inlineImageUrl: string;
  inlineImageAlt: string;
  inlineImageCaption: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  status: BlogStatus;
  publishAt: string;
  introductionHeading: string;
  introductionBody: string;
  bodyContent: string;
  quoteText: string;
  quoteAttribution: string;
  conclusionHeading: string;
  conclusionBody: string;
};

const DEFAULT_FORM: FormState = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  coverImageUrl: '',
  coverImageAlt: '',
  inlineImageUrl: '',
  inlineImageAlt: '',
  inlineImageCaption: '',
  authorName: 'Spencer Grey',
  authorRole: 'Artist & Founder',
  readTime: '4',
  status: 'draft',
  publishAt: '',
  introductionHeading: 'Introduction',
  introductionBody: '',
  bodyContent: '',
  quoteText: '',
  quoteAttribution: '',
  conclusionHeading: 'Conclusion',
  conclusionBody: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function splitParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildContentBlocks(form: FormState): BlogContentBlock[] {
  const blocks: BlogContentBlock[] = [];

  const introHeading = form.introductionHeading.trim();
  if (introHeading) {
    blocks.push({ type: 'heading', level: 2, text: introHeading });
  }

  splitParagraphs(form.introductionBody).forEach((paragraph) => {
    blocks.push({ type: 'paragraph', text: paragraph });
  });

  if (form.inlineImageUrl.trim()) {
    const inlineAlt = form.inlineImageAlt.trim() || form.title.trim();
    const inlineCaption = form.inlineImageCaption.trim();

    blocks.push({
      type: 'image',
      url: form.inlineImageUrl.trim(),
      alt: inlineAlt,
      caption: inlineCaption ? inlineCaption : undefined,
    });
  }

  splitParagraphs(form.bodyContent).forEach((paragraph) => {
    blocks.push({ type: 'paragraph', text: paragraph });
  });

  if (form.quoteText.trim()) {
    blocks.push({
      type: 'quote',
      text: form.quoteText.trim(),
      attribution: form.quoteAttribution.trim() || undefined,
    });
  }

  const conclusionHeading = form.conclusionHeading.trim();
  if (conclusionHeading) {
    blocks.push({ type: 'heading', level: 2, text: conclusionHeading });
  }

  splitParagraphs(form.conclusionBody).forEach((paragraph) => {
    blocks.push({ type: 'paragraph', text: paragraph });
  });

  return blocks;
}

function normalizeContent(rawContent: BlogPostRecord['content']) {
  if (!rawContent) {
    return [] as BlogContentBlock[];
  }

  if (Array.isArray(rawContent)) {
    return rawContent as BlogContentBlock[];
  }

  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent);
      return Array.isArray(parsed) ? (parsed as BlogContentBlock[]) : [];
    } catch (error) {
      console.error('Failed to parse blog post content JSON:', error);
      return [];
    }
  }

  return [] as BlogContentBlock[];
}

function extractFormFromStoredState(contentForm: Record<string, unknown> | null | undefined, content: BlogPostRecord['content']) {
  if (contentForm && Object.keys(contentForm).length > 0) {
    return {
      introductionHeading: String(contentForm.introductionHeading ?? ''),
      introductionBody: String(contentForm.introductionBody ?? ''),
      bodyContent: String(contentForm.bodyContent ?? ''),
      quoteText: String(contentForm.quoteText ?? ''),
      quoteAttribution: String(contentForm.quoteAttribution ?? ''),
      conclusionHeading: String(contentForm.conclusionHeading ?? ''),
      conclusionBody: String(contentForm.conclusionBody ?? ''),
      inlineImageUrl: String(contentForm.inlineImageUrl ?? ''),
      inlineImageAlt: String(contentForm.inlineImageAlt ?? ''),
      inlineImageCaption: String(contentForm.inlineImageCaption ?? ''),
    };
  }

  const blocks = normalizeContent(content);
  const introductionParagraphs: string[] = [];
  const bodyParagraphs: string[] = [];
  const conclusionParagraphs: string[] = [];
  let introductionHeading = '';
  let conclusionHeading = '';
  let inlineImageUrl = '';
  let inlineImageAlt = '';
  let inlineImageCaption = '';
  let quoteText = '';
  let quoteAttribution = '';
  let seenImageOrBody = false;
  let inConclusion = false;

  for (const block of blocks) {
    if (block.type === 'heading') {
      if (!introductionHeading) {
        introductionHeading = block.text;
      } else {
        conclusionHeading = block.text;
        inConclusion = true;
      }
      continue;
    }

    if (block.type === 'image') {
      inlineImageUrl = block.url;
      inlineImageAlt = block.alt;
      inlineImageCaption = block.caption ?? '';
      seenImageOrBody = true;
      continue;
    }

    if (block.type === 'quote') {
      quoteText = block.text;
      quoteAttribution = block.attribution ?? '';
      seenImageOrBody = true;
      continue;
    }

    if (block.type === 'paragraph') {
      if (inConclusion) {
        conclusionParagraphs.push(block.text);
      } else if (seenImageOrBody) {
        bodyParagraphs.push(block.text);
      } else {
        introductionParagraphs.push(block.text);
      }
    }
  }

  return {
    introductionHeading,
    introductionBody: introductionParagraphs.join('\n'),
    bodyContent: bodyParagraphs.join('\n'),
    quoteText,
    quoteAttribution,
    conclusionHeading,
    conclusionBody: conclusionParagraphs.join('\n'),
    inlineImageUrl,
    inlineImageAlt,
    inlineImageCaption,
  };
}

function resolveImage(src?: string | null) {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return `/${src}`;
  return `${baseUrl}/storage/v1/object/public/${src}`;
}

export default function EditBlogPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slugParam = params?.slug;

  const supabaseClient = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials are missing in environment variables.');
      return null;
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [slugEditedManually, setSlugEditedManually] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [initialPublishedAt, setInitialPublishedAt] = useState<string | null>(null);
  const [isCoverLibraryOpen, setIsCoverLibraryOpen] = useState(false);
  const [isInlineLibraryOpen, setIsInlineLibraryOpen] = useState(false);

  useEffect(() => {
    if (!supabaseClient || !slugParam) {
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('slug', slugParam)
        .maybeSingle();

      if (error) {
        console.error('Error loading blog post:', error);
        setLoadError('Unable to load this post. Please try again.');
        setLoading(false);
        return;
      }

      if (!data) {
        setLoadError('Post not found.');
        setLoading(false);
        return;
      }

      const record = data as BlogPostRecord;
      setPostId(record.id);
      setInitialPublishedAt(record.published_at);

      const hydrated = extractFormFromStoredState(record.content_form, record.content);

      setForm({
        title: record.title ?? '',
        slug: record.slug ?? '',
        category: record.category ?? '',
        excerpt: record.excerpt ?? '',
        coverImageUrl: record.cover_image ?? '',
        coverImageAlt: record.cover_image_alt ?? '',
        inlineImageUrl: hydrated.inlineImageUrl ?? '',
        inlineImageAlt: hydrated.inlineImageAlt ?? '',
        inlineImageCaption: hydrated.inlineImageCaption ?? '',
        authorName: record.author_name ?? 'Spencer Grey',
        authorRole: record.author_role ?? 'Artist & Founder',
        readTime: record.read_time_minutes ? String(record.read_time_minutes) : '4',
        status: (record.status as BlogStatus) ?? 'draft',
        publishAt: record.published_at ? new Date(record.published_at).toISOString().slice(0, 16) : '',
        introductionHeading: hydrated.introductionHeading || 'Introduction',
        introductionBody: hydrated.introductionBody || '',
        bodyContent: hydrated.bodyContent || '',
        quoteText: hydrated.quoteText || '',
        quoteAttribution: hydrated.quoteAttribution || '',
        conclusionHeading: hydrated.conclusionHeading || 'Conclusion',
        conclusionBody: hydrated.conclusionBody || '',
      });

      setLoading(false);
    };

    fetchPost();
  }, [slugParam, supabaseClient]);

  const handleInputChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'title' && !slugEditedManually) {
        updated.slug = slugify(value);
      }

      if (field === 'slug') {
        setSlugEditedManually(true);
      }

      return updated;
    });
  };

  const toReadableAlt = (name: string) =>
    name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();

  const resolveAlt = (currentAlt: string, title: string, fallback: string) => {
    const trimmedAlt = currentAlt.trim();
    if (trimmedAlt) {
      return trimmedAlt;
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      return trimmedTitle;
    }

    return fallback.trim();
  };

  const handleCoverUpload = (urls: string[]) => {
    if (urls.length === 0) return;
    const coverUrl = urls[0];
    const fallbackAlt = toReadableAlt(coverUrl.split('/').pop() ?? '');
    setForm((prev) => ({
      ...prev,
      coverImageUrl: coverUrl,
      coverImageAlt: resolveAlt(prev.coverImageAlt, prev.title, fallbackAlt),
    }));
  };

  const handleInlineUpload = (urls: string[]) => {
    if (urls.length === 0) return;
    const inlineUrl = urls[0];
    const fallbackAlt = toReadableAlt(inlineUrl.split('/').pop() ?? '');
    setForm((prev) => ({
      ...prev,
      inlineImageUrl: inlineUrl,
      inlineImageAlt: resolveAlt(prev.inlineImageAlt, prev.title, fallbackAlt),
    }));
  };

  const applyLibraryImage = (target: 'cover' | 'inline', image: StorageImage) => {
    const fallbackAlt = toReadableAlt(image.name);

    setForm((prev) => {
      if (target === 'cover') {
        return {
          ...prev,
          coverImageUrl: image.url,
          coverImageAlt: resolveAlt(prev.coverImageAlt, prev.title, fallbackAlt),
        };
      }

      return {
        ...prev,
        inlineImageUrl: image.url,
        inlineImageAlt: resolveAlt(prev.inlineImageAlt, prev.title, fallbackAlt),
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseClient || !postId) {
      setSaveError('Supabase is not configured.');
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);

    if (!form.title.trim()) {
      setSaveError('Please add a title for the post.');
      return;
    }

    if (!form.slug.trim()) {
      setSaveError('Please provide a URL slug for the post.');
      return;
    }

    if (!form.excerpt.trim()) {
      setSaveError('Please add a short excerpt for the listing page.');
      return;
    }

    if (!form.coverImageUrl.trim()) {
      setSaveError('Please provide a cover image.');
      return;
    }

    if (form.status === 'scheduled' && !form.publishAt.trim()) {
      setSaveError('Scheduled posts require a publish date.');
      return;
    }

    const readTimeMinutes = Number(form.readTime);
    if (Number.isNaN(readTimeMinutes) || readTimeMinutes <= 0) {
      setSaveError('Read time should be a positive number.');
      return;
    }

    const contentBlocks = buildContentBlocks(form);
    if (contentBlocks.length === 0) {
      setSaveError('Add at least one paragraph to the article.');
      return;
    }

    setSaving(true);

    const publishAt = form.publishAt ? new Date(form.publishAt).toISOString() : null;
    const computedPublishedAt =
      form.status === 'published'
        ? publishAt ?? initialPublishedAt ?? new Date().toISOString()
        : form.status === 'scheduled'
          ? publishAt
          : null;

    const contentFormState = {
      introductionHeading: form.introductionHeading.trim(),
      introductionBody: form.introductionBody.trim(),
      bodyContent: form.bodyContent.trim(),
      quoteText: form.quoteText.trim(),
      quoteAttribution: form.quoteAttribution.trim(),
      conclusionHeading: form.conclusionHeading.trim(),
      conclusionBody: form.conclusionBody.trim(),
      inlineImageUrl: form.inlineImageUrl.trim(),
      inlineImageAlt: form.inlineImageAlt.trim(),
      inlineImageCaption: form.inlineImageCaption.trim(),
    };

    const { error } = await supabaseClient
      .from('blog_posts')
      .update({
        title: form.title.trim(),
        slug: slugify(form.slug),
        excerpt: form.excerpt.trim(),
        category: form.category.trim() || null,
        cover_image: form.coverImageUrl.trim(),
        cover_image_alt: form.coverImageAlt.trim() || null,
        author_name: form.authorName.trim() || 'Spencer Grey',
        author_role: form.authorRole.trim() || null,
        read_time_minutes: readTimeMinutes,
        status: form.status,
        published_at: computedPublishedAt,
        content: contentBlocks,
        content_form: contentFormState,
      })
      .eq('id', postId);

    if (error) {
      console.error('Error updating blog post:', error);
      setSaveError(error.message || 'Unable to update the post. Please try again.');
    } else {
      setSaveSuccess('Post updated successfully.');
      router.refresh();
      setInitialPublishedAt(computedPublishedAt ?? null);
    }

    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Journal</p>
          <h1 className="text-3xl font-serif mt-2">Edit Post</h1>
        </div>
        <Link href="/admin/blog" className="text-sm text-gray-600 hover:text-black inline-flex items-center gap-1">
          <span aria-hidden>←</span>
          Back to journal
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-96 w-full bg-gray-100 animate-pulse rounded" />
        </div>
      ) : loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {loadError}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg p-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={handleInputChange('title')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Post title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={handleInputChange('slug')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="post-slug"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={handleInputChange('category')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Announcements"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={handleInputChange('excerpt')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                rows={3}
                placeholder="Short summary for the blog listing page"
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif">Cover image</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ImageUploader
                bucketName="blog"
                multiple={false}
                onUploadComplete={handleCoverUpload}
                className="bg-gray-50 flex-1"
              />
              <button
                type="button"
                onClick={() => setIsCoverLibraryOpen(true)}
                className="text-sm font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline"
              >
                Choose from Image Library
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover image URL</label>
                <input
                  type="text"
                  value={form.coverImageUrl}
                  onChange={handleInputChange('coverImageUrl')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt text</label>
                <input
                  type="text"
                  value={form.coverImageAlt}
                  onChange={handleInputChange('coverImageAlt')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </div>
            {form.coverImageUrl && (
              <div className="relative h-48 w-full md:w-72 border border-gray-200 rounded-md overflow-hidden">
                <Image
                  src={resolveImage(form.coverImageUrl) ?? form.coverImageUrl}
                  alt={form.coverImageAlt || form.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 288px, 100vw"
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif">Inline image (optional)</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ImageUploader
                bucketName="blog"
                multiple={false}
                onUploadComplete={handleInlineUpload}
                className="bg-gray-50 flex-1"
              />
              <button
                type="button"
                onClick={() => setIsInlineLibraryOpen(true)}
                className="text-sm font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline"
              >
                Choose from Image Library
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={form.inlineImageUrl}
                  onChange={handleInputChange('inlineImageUrl')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt text</label>
                <input
                  type="text"
                  value={form.inlineImageAlt}
                  onChange={handleInputChange('inlineImageAlt')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Studio photograph description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <input
                  type="text"
                  value={form.inlineImageCaption}
                  onChange={handleInputChange('inlineImageCaption')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Optional caption"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif">Article template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Introduction heading</label>
                <input
                  type="text"
                  value={form.introductionHeading}
                  onChange={handleInputChange('introductionHeading')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion heading</label>
                <input
                  type="text"
                  value={form.conclusionHeading}
                  onChange={handleInputChange('conclusionHeading')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Introduction paragraphs</label>
              <textarea
                value={form.introductionBody}
                onChange={handleInputChange('introductionBody')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                rows={4}
                placeholder="Separate paragraphs with a new line."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main story</label>
              <textarea
                value={form.bodyContent}
                onChange={handleInputChange('bodyContent')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                rows={6}
                placeholder="Share your process, new collection details, or exhibition notes."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pull quote</label>
                <textarea
                  value={form.quoteText}
                  onChange={handleInputChange('quoteText')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  rows={3}
                  placeholder="Add a standout sentence to highlight in the article."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quote attribution</label>
                <input
                  type="text"
                  value={form.quoteAttribution}
                  onChange={handleInputChange('quoteAttribution')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Spencer Grey"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
              <textarea
                value={form.conclusionBody}
                onChange={handleInputChange('conclusionBody')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                rows={4}
                placeholder="Wrap up with a call to action or thank you."
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author name</label>
              <input
                type="text"
                value={form.authorName}
                onChange={handleInputChange('authorName')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author role</label>
              <input
                type="text"
                value={form.authorRole}
                onChange={handleInputChange('authorRole')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Read time (minutes)</label>
              <input
                type="number"
                min={1}
                value={form.readTime}
                onChange={handleInputChange('readTime')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={form.status}
                onChange={handleInputChange('status')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publish at</label>
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={handleInputChange('publishAt')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                For published posts, leave blank to keep the current publish date.
              </p>
            </div>
          </section>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {saveSuccess}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              className="text-sm text-gray-500 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      <ImageLibraryPickerModal
        isOpen={isCoverLibraryOpen}
        onClose={() => setIsCoverLibraryOpen(false)}
        onSelect={(image) => applyLibraryImage('cover', image)}
        buckets={['blog', 'artworks', 'collections', 'about']}
        initialBucket="blog"
      />
      <ImageLibraryPickerModal
        isOpen={isInlineLibraryOpen}
        onClose={() => setIsInlineLibraryOpen(false)}
        onSelect={(image) => applyLibraryImage('inline', image)}
        buckets={['blog', 'artworks', 'collections', 'about']}
        initialBucket="blog"
      />
    </div>
  );
}
