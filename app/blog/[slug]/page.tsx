import type { Metadata } from 'next';
import type React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

import BlogPostContent from '@/components/blog/blog-post-content';
import BlogPostCard, { resolveCoverImage } from '@/components/blog/blog-post-card';
import ReadingProgress from '@/components/blog/reading-progress';
import TableOfContents from '@/components/blog/table-of-contents';
import SocialShare from '@/components/shared/social-share';
import JsonLd from '@/components/shared/json-ld';
import { generateArticleSchema } from '@/lib/seo/schema';
import { extractHeadings } from '@/lib/blog/headings';
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from '@/lib/db/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergreyart.com';

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
  if (!post) return null;
  const relatedCandidates = (await fetchPublishedBlogPosts()).filter((p) => p.slug !== slug);
  return { post, relatedPosts: relatedCandidates.slice(0, 3) };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: 'Post not found' };

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
      images: [{ url: coverImage, width: 1280, height: 720, alt: post.cover_image_alt || post.title }],
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
  if (!result) notFound();

  const { post, relatedPosts } = result;
  const heroImage = resolveCoverImage(post.cover_image ?? undefined);
  const heroAlt = post.cover_image_alt || post.title;
  const publishedDate = post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : undefined;
  const shareUrl = `/blog/${post.slug}`;
  const tocItems = extractHeadings(post.content);
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
    <article className="bg-[#F6F4F0]">
      <ReadingProgress />
      <JsonLd id={`blog-article-${post.slug}`} data={structuredData} />

      {/* Article header */}
      <header className="px-4 md:px-6 pt-10 md:pt-20 pb-8 md:pb-10 border-b border-[#020312]/8">
        <div className="max-w-[1400px] mx-auto">
          <nav className="text-xs uppercase tracking-[0.3em] text-[#020312]/50 mb-8 flex gap-2">
            <Link href="/blog" className="hover:text-[#020312] transition-colors">Journal</Link>
            <span aria-hidden="true">›</span>
            <span>{post.category || 'Story'}</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#020312] leading-[1.05] mb-10" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-[#020312]/10">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#EDEAE4] shrink-0">
                <Image
                  src="https://pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev/artworks/headshot.jpg"
                  alt={post.author_name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="text-xs uppercase tracking-[0.25em] text-[#020312]/60 space-y-1">
                <p>{post.author_name}</p>
                <p>
                  {publishedDate}
                  {post.read_time_minutes ? ` · ${post.read_time_minutes} min read` : ''}
                </p>
              </div>
            </div>
            <SocialShare url={shareUrl} title={post.title} description={post.excerpt} />
          </div>
        </div>
      </header>

      {/* Hero image */}
      {heroImage && (
        <div className="w-full">
          <div className="max-w-[1400px] mx-auto px-6 pb-0">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={heroImage}
                alt={heroAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 1200px, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Article body: content + sticky sidebar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-24">
        <div className="flex gap-10 xl:gap-12">

          {/* Main content */}
          <main className="min-w-0 flex-1 max-w-[740px]">
            <BlogPostContent blocks={post.content} />
          </main>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-28 self-start">
            <div className="space-y-12">
              {tocItems.length > 0 && (
                <TableOfContents items={tocItems} />
              )}

              {/* Artist card */}
              <div className="border-t border-[#020312]/10 pt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#EDEAE4] shrink-0">
                    <Image
                      src="https://pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev/artworks/headshot.jpg"
                      alt="Spencer Grey"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#020312]">Spencer Grey</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#020312]/40">Artist</p>
                  </div>
                </div>
                <p className="text-xs text-[#020312]/60 leading-relaxed">
                  Limited edition prints, made to order. Each piece closes at 150 prints.
                </p>
                <Link
                  href="/shop"
                  className="block text-center text-xs uppercase tracking-[0.2em] bg-[#020312] text-white py-2.5 hover:bg-black/80 transition-colors"
                >
                  Shop Prints
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-[#020312]/10 px-4 md:px-6 py-10 md:py-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-12">
              <h2 className="font-serif text-3xl text-[#020312]">More from the journal</h2>
              <Link href="/blog" className="text-xs uppercase tracking-[0.25em] text-[#020312]/50 hover:text-[#020312] transition-colors">
                View all
              </Link>
            </div>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
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
