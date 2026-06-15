"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import ImageUploader from '@/components/admin/image-uploader';
import ImageLibraryPickerModal from '@/components/admin/image-library-picker-modal';
import type { R2Image } from '@/lib/storage/r2';
import { createRichTextHtml } from '@/lib/blog/rich-text';
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
  authorName: string;
  authorRole: string;
  readTime: string;
  status: BlogStatus;
  publishAt: string;
  richText: string;
};

const DEFAULT_FORM: FormState = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  coverImageUrl: '',
  coverImageAlt: '',
  authorName: 'Spencer Grey',
  authorRole: 'Artist & Founder',
  readTime: '4',
  status: 'draft',
  publishAt: '',
  richText: '',
};

const SAMPLE_RICH_TEXT = `# Introduction

This is a starting paragraph for your journal story. Share the mood and set expectations for the reader.

![Studio view inside Spencer's workspace](https://www.spencergreyart.com/_next/image?url=https%3A%2F%2Fudanlcylpsvxqlihcppb.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fartworks%2F39a6611c-98f7-4bf0-88a7-016a80edcdc5.jpg&w=2048&q=75 "Studio view inside Spencer's workspace")

Add additional paragraphs after the image to go deeper into the narrative and process behind the work.

## Closing thoughts

Wrap up the entry with what's next, an invitation, or a reflection.`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function buildContentBlocks(form: FormState): BlogContentBlock[] {
  const { html, raw } = createRichTextHtml(form.richText);
  if (!html) {
    return [];
  }

  return [
    {
      type: 'rich_text',
      html,
      raw,
    },
  ];
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
    } catch {
      const { html, raw } = createRichTextHtml(rawContent);
      if (html) {
        return [
          {
            type: 'rich_text',
            html,
            raw,
          } as BlogContentBlock,
        ];
      }
      return [];
    }
  }

  return [] as BlogContentBlock[];
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function convertHtmlToRaw(html: string) {
  if (!html) {
    return '';
  }

  const withLineBreaks = html
    .replace(/<\/(p|h2|h3|h4|blockquote|ul|ol)>/gi, '</$1>\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n');

  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(withoutTags).replace(/\n{3,}/g, '\n\n').trim();
}

function blocksToRichText(blocks: BlogContentBlock[]): string {
  const segments: string[] = [];

  const escapeAlt = (value: string) => value.replace(/]/g, '\\]');
  const escapeCaption = (value: string) => value.replace(/"/g, '\\"');

  blocks.forEach((block) => {
    if (block.type === 'heading') {
      const level = block.level ?? 2;
      const marker = '#'.repeat(Math.max(1, Math.min(level - 1, 3)));
      segments.push(`${marker} ${block.text}`);
      return;
    }

    if (block.type === 'paragraph') {
      segments.push(block.text);
      return;
    }

    if (block.type === 'quote') {
      const lines = block.text
        .split('\n')
        .map((line) => `> ${line.trim()}`)
        .join('\n');
      segments.push(lines);
      return;
    }

    if (block.type === 'image') {
      const caption = block.caption ? ` "${escapeCaption(block.caption)}"` : '';
      segments.push(`![${escapeAlt(block.alt)}](${block.url}${caption})`);
      return;
    }

    if (block.type === 'rich_text') {
      const raw = 'raw' in block && typeof block.raw === 'string' ? block.raw : '';
      if (raw) {
        segments.push(raw);
      } else if ('html' in block && typeof block.html === 'string') {
        segments.push(convertHtmlToRaw(block.html));
      }
    }
  });

  return segments.filter(Boolean).join('\n\n').trim();
}

function extractFormFromStoredState(
  contentForm: Record<string, unknown> | null | undefined,
  content: BlogPostRecord['content'],
) {
  if (contentForm && typeof contentForm.richText === 'string') {
    return {
      richText: String(contentForm.richText),
    };
  }

  const blocks = normalizeContent(content);
  if (blocks.length === 0) {
    return {
      richText: '',
    };
  }

  const richBlock = blocks.find((block) => block.type === 'rich_text') as
    | (BlogContentBlock & { raw?: string; html?: string })
    | undefined;

  if (richBlock) {
    if (typeof richBlock.raw === 'string' && richBlock.raw.trim().length > 0) {
      return { richText: richBlock.raw };
    }

    if (typeof richBlock.html === 'string') {
      return { richText: convertHtmlToRaw(richBlock.html) };
    }
  }

  return {
    richText: blocksToRichText(blocks),
  };
}

function resolveImage(src?: string | null) {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!baseUrl) return `/${src}`;
  return `${baseUrl}/${src}`;
}

export default function EditBlogPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slugParam = params?.slug;

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

  useEffect(() => {
    if (!slugParam) return;

    const fetchPost = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/admin/blog/${slugParam}`);
        if (!response.ok) {
          setLoadError(response.status === 404 ? 'Post not found.' : 'Unable to load this post. Please try again.');
          return;
        }

        const data = await response.json() as BlogPostRecord;
        setPostId(data.id);
        setInitialPublishedAt(data.published_at);

        const hydrated = extractFormFromStoredState(data.content_form, data.content);

        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          category: data.category ?? '',
          excerpt: data.excerpt ?? '',
          coverImageUrl: data.cover_image ?? '',
          coverImageAlt: data.cover_image_alt ?? '',
          authorName: data.author_name ?? 'Spencer Grey',
          authorRole: data.author_role ?? 'Artist & Founder',
          readTime: data.read_time_minutes ? String(data.read_time_minutes) : '4',
          status: (data.status as BlogStatus) ?? 'draft',
          publishAt: data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : '',
          richText: hydrated.richText ?? '',
        });
      } catch (err) {
        console.error('Error loading blog post:', err);
        setLoadError('Unable to load this post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slugParam]);

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

  const applyLibraryImage = (image: R2Image) => {
    const fallbackAlt = toReadableAlt(image.key.split('/').pop() ?? image.key);

    setForm((prev) => {
      return {
        ...prev,
        coverImageUrl: image.url,
        coverImageAlt: resolveAlt(prev.coverImageAlt, prev.title, fallbackAlt),
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!postId) {
      setSaveError('Post ID not loaded yet.');
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
      setSaveError('Add the article body before saving.');
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
      richText: form.richText.trim(),
    };

    const updateResponse = await fetch(`/api/admin/blog/${slugParam}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });

    if (!updateResponse.ok) {
      const body = await updateResponse.json();
      console.error('Error updating blog post:', body);
      setSaveError(body.error || 'Unable to update the post. Please try again.');
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
            <h2 className="text-xl font-serif">Article body</h2>
            <p className="text-sm text-gray-600">
              Write the full story here. Separate paragraphs with a blank line. Start lines with <code>#</code> or
              <code>##</code> for headings, use <code>&gt;</code> for pull quotes, and add inline images with{' '}
              <code>![Alt text](https://image-url.jpg &quot;Optional caption&quot;)</code>. Keep a blank line before and after image
              syntax for best results.
            </p>
            <textarea
              value={form.richText}
              onChange={handleInputChange('richText')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
              rows={16}
              placeholder={SAMPLE_RICH_TEXT}
            />
            <p className="text-xs text-gray-400">
              Formatting tips: blank lines create new paragraphs, numbered lists (e.g. <code>1.</code>) and bullet lists
              (e.g. <code>-</code>) are supported.
            </p>
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
        onSelect={applyLibraryImage}
        buckets={['blog', 'artworks', 'collections', 'about']}
        initialBucket="blog"
      />
    </div>
  );
}
