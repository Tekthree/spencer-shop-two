"use client";

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

import ImageUploader from '@/components/admin/image-uploader';
import ImageLibraryPickerModal from '@/components/admin/image-library-picker-modal';
import type { StorageImage } from '@/lib/supabase/storage';
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
}

const DEFAULT_FORM: FormState = {
  title: '',
  slug: '',
  category: 'Announcements',
  excerpt: '',
  coverImageUrl: '',
  coverImageAlt: '',
  inlineImageUrl: '',
  inlineImageAlt: '',
  inlineImageCaption: '',
  authorName: 'Spencer Grey',
  authorRole: 'Artist & Founder',
  readTime: '4',
  status: 'published',
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

  if (form.inlineImageUrl) {
    const inlineAlt = form.inlineImageAlt.trim() || form.title;
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

  if (form.quoteText) {
    blocks.push({
      type: 'quote',
      text: form.quoteText,
      attribution: form.quoteAttribution || undefined,
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

function resolveImage(src?: string | null) {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return `/${src}`;
  return `${baseUrl}/storage/v1/object/public/${src}`;
}

export default function BlogAdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCoverLibraryOpen, setIsCoverLibraryOpen] = useState(false);
  const [isInlineLibraryOpen, setIsInlineLibraryOpen] = useState(false);

  const supabaseClient = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials are missing in environment variables.');
      return null;
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    if (!supabaseClient) {
      setPostsError('Supabase credentials are not configured.');
      setLoadingPosts(false);
      return;
    }

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);

      const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('id, title, slug, status, published_at, created_at, category, cover_image')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        setPostsError('Unable to load blog posts. Please try again.');
      } else {
        setPosts(data ?? []);
      }

      setLoadingPosts(false);
    };

    fetchPosts();
  }, [supabaseClient]);

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

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setSlugEditedManually(false);
  };

  const refreshPosts = async () => {
    if (!supabaseClient) {
      return;
    }

    const { data, error } = await supabaseClient
      .from('blog_posts')
      .select('id, title, slug, status, published_at, created_at, category, cover_image')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error refreshing blog posts:', error);
      return;
    }

    setPosts(data ?? []);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseClient) {
      setFormError('Supabase credentials are not configured.');
      return;
    }

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
      setFormError('Add at least one paragraph to the article.');
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

    const { error } = await supabaseClient.from('blog_posts').insert({
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
    });

    if (error) {
      console.error('Error creating blog post:', error);
      setFormError(error.message || 'Unable to create blog post. Please try again.');
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
