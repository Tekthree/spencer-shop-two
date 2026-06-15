"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

import ImageUploader from '@/components/admin/image-uploader';
import ImageLibraryPickerModal from '@/components/admin/image-library-picker-modal';
import type { R2Image } from '@/lib/storage/r2';
import { createRichTextHtml } from '@/lib/blog/rich-text';
import type { BlogContentBlock } from '@/types/blog';

interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  category?: string;
  cover_image?: string;
}

type BlogStatus = 'draft' | 'published' | 'scheduled';

type ActiveTab = 'create' | 'posts';

interface FormState {
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
}

const SAMPLE_RICH_TEXT = `# Introduction

This is a starting paragraph for your journal story. Share the mood and set expectations for the reader.

![Studio view inside Spencer's workspace](https://www.spencergreyart.com/_next/image?url=https%3A%2F%2Fudanlcylpsvxqlihcppb.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fartworks%2F39a6611c-98f7-4bf0-88a7-016a80edcdc5.jpg&w=2048&q=75 "Studio view inside Spencer's workspace")

Add additional paragraphs after the image to go deeper into the narrative and process behind the work.

## Closing thoughts

Wrap up the entry with what's next, an invitation, or a reflection.`;

const DEFAULT_FORM: FormState = {
  title: '',
  slug: '',
  category: 'Announcements',
  excerpt: '',
  coverImageUrl: '',
  coverImageAlt: '',
  authorName: 'Spencer Grey',
  authorRole: 'Artist & Founder',
  readTime: '4',
  status: 'published',
  publishAt: '',
  richText: SAMPLE_RICH_TEXT,
};

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

function resolveImage(src?: string | null) {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!baseUrl) return `/${src}`;
  return `${baseUrl}/${src}`;
}

export default function BlogAdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCoverLibraryOpen, setIsCoverLibraryOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);

      try {
        const response = await fetch('/api/admin/blog');
        if (!response.ok) throw new Error('Unable to load blog posts');
        const data = await response.json();
        setPosts(data ?? []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setPostsError('Unable to load blog posts. Please try again.');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

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

  const resetForm = () => {
    setForm({ ...DEFAULT_FORM });
    setSlugEditedManually(false);
  };

  const refreshPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog');
      if (!response.ok) return;
      const data = await response.json();
      setPosts(data ?? []);
    } catch (err) {
      console.error('Error refreshing blog posts:', err);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError('Please add a title for the post.');
      return;
    }

    if (!form.slug.trim()) {
      setFormError('Please provide a URL slug for the post.');
      return;
    }

    if (!form.excerpt.trim()) {
      setFormError('Please add a short excerpt for the listing page.');
      return;
    }

    if (!form.coverImageUrl.trim()) {
      setFormError('Please provide a cover image.');
      return;
    }

    const readTimeMinutes = Number(form.readTime);
    if (Number.isNaN(readTimeMinutes) || readTimeMinutes <= 0) {
      setFormError('Read time should be a positive number.');
      return;
    }

    const contentBlocks = buildContentBlocks(form);
    if (contentBlocks.length === 0) {
      setFormError('Add the article body before publishing.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const publishAt = form.publishAt ? new Date(form.publishAt).toISOString() : null;
    const computedPublishedAt =
      form.status === 'published'
        ? publishAt ?? new Date().toISOString()
        : publishAt;

    const contentFormState = {
      richText: form.richText.trim(),
    };

    const response = await fetch('/api/admin/blog', {
      method: 'POST',
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

    if (!response.ok) {
      const body = await response.json();
      console.error('Error creating blog post:', body);
      setFormError(body.error || 'Unable to create blog post. Please try again.');
    } else {
      setFormSuccess('Blog post created successfully.');
      resetForm();
      await refreshPosts();
      setActiveTab('posts');
    }

    setSubmitting(false);
  };

  const renderPostsTab = () => (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">Journal Posts</h1>
          <p className="text-gray-600">Review published stories, drafts, and scheduled announcements.</p>
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          onClick={() => setActiveTab('create')}
        >
          Create new post
        </button>
      </header>

      {postsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {postsError}
        </div>
      )}

      {loadingPosts ? (
        <div className="bg-white border border-gray-100 rounded-lg p-8">
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-gray-200 h-16 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center">
          <h2 className="text-xl font-serif mb-3">No posts yet</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Use the create tab to publish launch updates, studio notes, and future collection announcements.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-lg divide-y">
          {posts.map((post) => {
            const coverPreview = resolveImage(post.cover_image);
            const publishedLabel = post.published_at
              ? format(new Date(post.published_at), 'MMM d, yyyy')
              : 'Not published';

            return (
              <div key={post.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
                    {coverPreview ? (
                      <Image src={coverPreview} alt={post.title} fill className="object-cover" sizes="80px" />
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center justify-center h-full w-full">
                        No image
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      {post.title}
                      <span className={`text-xs uppercase tracking-wide px-2 py-1 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'scheduled'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-200 text-gray-700'
                      }`}>
                        {post.status}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {post.category ? `${post.category} • ` : ''}{publishedLabel}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Slug: {post.slug}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="text-sm text-gray-600 underline underline-offset-4 hover:text-black"
                  >
                    Edit post
                  </Link>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-black underline underline-offset-4"
                    target="_blank"
                  >
                    View live post
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCreateTab = () => (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-3xl font-serif mb-2">Create a Journal Post</h1>
        <p className="text-gray-600">
          Use the launch template to publish announcements, studio diaries, or exhibition recaps.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg p-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleInputChange('title')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Announcing the Spencer Grey Art Store"
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
              placeholder="announcing-the-spencer-grey-art-store"
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
              placeholder="Share a one sentence summary for the blog listing page."
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif">Cover image</h2>
          <p className="text-sm text-gray-500">
            Upload a hero image or paste a public URL. The same image can be embedded inside the article using the inline image uploader below.
          </p>
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
              <Image src={resolveImage(form.coverImageUrl) ?? form.coverImageUrl} alt={form.coverImageAlt || form.title} fill className="object-cover" sizes="(min-width: 768px) 288px, 100vw" />
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
            Formatting tips: blank lines create new paragraphs, numbered lists (e.g. <code>1.</code>) and bullet lists (e.g.
            <code>-</code>) are supported.
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
              Leave empty to publish immediately when status is set to Published.
            </p>
          </div>
        </section>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {formSuccess}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-gray-500 hover:text-black"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publishing…' : 'Publish post'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-md border ${
            activeTab === 'create' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'
          }`}
        >
          Create Post
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-md border ${
            activeTab === 'posts' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'
          }`}
        >
          View Posts
        </button>
      </div>

      {activeTab === 'create' ? renderCreateTab() : renderPostsTab()}
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
