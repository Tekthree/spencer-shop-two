import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import BlogPostCard, { resolveCoverImage } from '@/components/blog/blog-post-card';
import { fetchPublishedBlogPosts } from '@/lib/db/blog';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Stories from the studio, exhibition highlights, and behind-the-scenes notes from Spencer Grey.',
};

export default async function BlogIndexPage() {
  const posts = await fetchPublishedBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="bg-[#F6F4F0]">
      {/* Header */}
      <div className="px-6 pt-14 md:pt-20 pb-10 border-b border-[#020312]/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#020312]/40 mb-3">Journal</p>
            <h1 className="font-serif text-5xl md:text-7xl text-[#020312] leading-none">
              Notes from<br />the studio
            </h1>
          </div>
          <p className="text-sm text-[#020312]/60 max-w-xs leading-relaxed md:text-right">
            Process, exhibitions, and stories from the making of each piece.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 space-y-24">

        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-serif text-3xl text-[#020312] mb-4">Stories are on the way</h2>
            <p className="text-sm text-[#020312]/60 max-w-sm mx-auto">
              The journal launches alongside the store. Check back soon for studio updates and new release notes.
            </p>
          </div>
        ) : (
          <>
            {/* Featured post — large */}
            {featured && (
              <article>
                <Link href={`/blog/${featured.slug}`} className="group block">
                  {resolveCoverImage(featured.cover_image || undefined) && (
                    <div className="relative aspect-[16/8] overflow-hidden mb-8 bg-[#EDEAE4]">
                      <Image
                        src={resolveCoverImage(featured.cover_image || undefined)!}
                        alt={featured.cover_image_alt || featured.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(min-width: 1200px) 1200px, 100vw"
                        priority
                      />
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-start">
                    <div>
                      {featured.category && (
                        <p className="text-xs uppercase tracking-[0.3em] text-[#020312]/50 mb-3">
                          {featured.category}
                        </p>
                      )}
                      <h2 className="font-serif text-4xl md:text-5xl text-[#020312] leading-tight group-hover:underline">
                        {featured.title}
                      </h2>
                    </div>
                    <div className="space-y-4 md:pt-2">
                      {featured.excerpt && (
                        <p className="text-base text-[#020312]/70 leading-relaxed">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="text-xs uppercase tracking-[0.25em] text-[#020312]/50">
                        {featured.published_at && format(new Date(featured.published_at), 'MMMM d, yyyy')}
                        {featured.read_time_minutes ? ` · ${featured.read_time_minutes} min` : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Remaining posts grid */}
            {rest.length > 0 && (
              <div>
                <div className="border-t border-[#020312]/10 pt-16">
                  <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
