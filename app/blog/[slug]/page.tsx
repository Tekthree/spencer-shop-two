import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

import BlogPostContent from '@/components/blog/blog-post-content';
import BlogPostCard, { resolveCoverImage } from '@/components/blog/blog-post-card';
import SocialShare from '@/components/shared/social-share';
import JsonLd from '@/components/shared/json-ld';
import { generateArticleSchema } from '@/lib/seo/schema';
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from '@/lib/db/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';

export async function generateStaticParams() {
  try {
    const posts = await fetchPublishedBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

async function getPost(slug: string) {
  const post = await fetchBlogPostBySlug(slug);
  if (!post) {
    return null;
  }

  const relatedCandidates = (await fetchPublishedBlogPosts()).filter((item) => item.slug !== slug);
  const relatedPosts = relatedCandidates.slice(0, 3);

  return { post, relatedPosts };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  const url = `${BASE_URL}/blog/${post.slug}`;
  const coverImage = resolveCoverImage(post.cover_image || undefined) || `${BASE_URL}/hero-spencer.jpg`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url,
      type: 'article',
      images: [
        {
          url: coverImage,
          width: 1280,
          height: 720,
          alt: post.cover_image_alt || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: [coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await getPost(slug);

  if (!result) {
    notFound();
  }

  const { post, relatedPosts } = result;
  const heroImage = resolveCoverImage(post.cover_image ?? undefined);
  const heroAlt = post.cover_image_alt || post.title;
  const publishedDate = post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : undefined;
  const shareUrl = `/blog/${post.slug}`;
  const authorInitial =
    post.author_name?.trim().charAt(0).toUpperCase() || post.author_role?.trim().charAt(0).toUpperCase() || 'S';
  const structuredData = generateArticleSchema({
    title: post.title,
    description: post.excerpt || post.title,
    url: shareUrl,
    image: heroImage || '/images/og-image.jpg',
    publishedAt: post.published_at || new Date().toISOString(),
    modifiedAt: post.updated_at || post.published_at || undefined,
    authorName: post.author_name || 'Spencer Grey',
  });

  return (
    <article className="bg-white">
      <JsonLd id={`blog-article-${post.slug}`} data={structuredData} />
      <header className="px-6 pt-16 md:pt-24">
        <div className="max-w-3xl mx-auto">
          <nav className="text-xs uppercase tracking-[0.35em] text-[#020312]/60 mb-10 flex gap-2">
            <Link href="/blog" className="hover:text-[#020312]">
              Blog
            </Link>
            <span>›</span>
            {post.category ? <span>{post.category}</span> : <span>Story</span>}
          </nav>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#020312] leading-tight mb-8">
            {post.title}
          </h1>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#EDEAE4] text-[#020312] flex items-center justify-center font-serif text-2xl">
                {authorInitial}
              </div>
              <div className="space-y-1 text-xs uppercase tracking-[0.35em] text-[#020312]/65">
                <p>{post.author_name}</p>
                <p>
                  {publishedDate}
                  {post.read_time_minutes ? ` • ${post.read_time_minutes} min read` : ''}
                </p>
              </div>
            </div>
            <div className="text-xs uppercase tracking-[0.35em] text-[#020312]/60">
              {post.category}
            </div>
          </div>
        </div>
      </header>

      {heroImage && (
        <div className="px-6 mt-12">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-[#020312]/10 bg-[#EDEAE4]">
              <Image
                src={heroImage}
                alt={heroAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 80vw, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-16">
          <BlogPostContent blocks={post.content} />

          <section className="border-t border-[#020312]/10 pt-10">
            <p className="text-xs uppercase tracking-[0.35em] text-[#020312]/60 mb-4">
              Share this post
            </p>
            <SocialShare url={shareUrl} title={post.title} description={post.excerpt} />
          </section>
        </div>
      </div>

      <section className="px-6 pt-6 pb-16 md:pb-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F6F4F0] border border-[#020312]/10 rounded-2xl p-10 md:p-14 text-center">
            <h2 className="font-serif text-3xl md:text-[2.5rem] text-[#020312] mb-4">
              Subscribe to our newsletter
            </h2>
            <p className="text-sm md:text-base text-[#020312]/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Learn more about upcoming shows, special releases, and the stories shaping Spencer&apos;s studio practice.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Email address"
                className="flex-1 sm:flex-none sm:min-w-[260px] border border-[#020312]/20 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#020312] bg-white"
                required
              />
              <button
                type="submit"
                className="bg-[#020312] text-white rounded-full px-8 py-3 text-sm uppercase tracking-[0.35em] hover:bg-[#020312]/90 transition-colors"
              >
                Sign up
              </button>
            </form>
            <p className="text-xs text-[#020312]/50 mt-4">
              Thoughtful notes only. No inbox clutter.
            </p>
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#020312]/50 mb-3">Related posts</p>
                <h2 className="font-serif text-3xl md:text-4xl text-[#020312] leading-tight">More from the journal</h2>
            </div>
            <Link href="/blog" className="text-xs uppercase tracking-[0.35em] text-[#020312]/60 hover:text-[#020312]">
              View all
            </Link>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <BlogPostCard key={related.id} post={related} />
            ))}
          </div>
          </div>
        </section>
      )}
    </article>
  );
}
