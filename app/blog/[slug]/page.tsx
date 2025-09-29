import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

import BlogPostContent from '@/components/blog/blog-post-content';
import BlogPostCard, { resolveCoverImage } from '@/components/blog/blog-post-card';
import SocialShare from '@/components/shared/social-share';
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from '@/lib/supabase/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';

export async function generateStaticParams() {
  const posts = await fetchPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
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

  return (
    <article className="px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs uppercase tracking-[0.3em] text-[#020312]/60 mb-8 flex gap-2">
          <Link href="/blog" className="hover:text-[#020312]">
            Blog
          </Link>
          <span>›</span>
          {post.category ? <span>{post.category}</span> : <span>Story</span>}
        </nav>

        <h1 className="font-serif text-4xl md:text-6xl text-[#020312] leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="space-y-1 text-sm uppercase tracking-[0.3em] text-[#020312]/60">
            <p>By {post.author_name}</p>
            <p>
              {publishedDate}
              {post.read_time_minutes ? ` • ${post.read_time_minutes} min read` : ''}
            </p>
          </div>
          <SocialShare url={shareUrl} title={post.title} description={post.excerpt} />
        </div>
      </div>

      {heroImage && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[#EDEAE4]">
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
      )}

      <div className="max-w-3xl mx-auto">
        <BlogPostContent blocks={post.content} />
      </div>

      <section className="max-w-3xl mx-auto mt-16 md:mt-24">
        <div className="bg-white border border-[#020312]/10 rounded-lg p-8 md:p-12">
          <h2 className="font-serif text-3xl text-[#020312] mb-4">Sign up for studio updates</h2>
          <p className="text-sm text-[#020312]/70 mb-6 max-w-lg">
            Be the first to hear about new releases, limited edition drops, and upcoming exhibitions from Spencer Grey.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              className="flex-1 border border-[#020312]/20 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#020312] bg-[#F6F4F0]"
              required
            />
            <button
              type="submit"
              className="bg-[#020312] text-white rounded-full px-8 py-3 text-sm uppercase tracking-[0.3em] hover:bg-[#020312]/90"
            >
              Sign up
            </button>
          </form>
          <p className="text-xs text-[#020312]/50 mt-4">
            We respect your inbox. Only thoughtful updates and art announcements.
          </p>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16 md:mt-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#020312]/50 mb-3">Related posts</p>
              <h2 className="font-serif text-3xl text-[#020312]">More from the journal</h2>
            </div>
            <Link href="/blog" className="text-xs uppercase tracking-[0.3em] text-[#020312]/60 hover:text-[#020312]">
              View all
            </Link>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <BlogPostCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
