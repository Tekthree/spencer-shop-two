import type { Metadata } from 'next';
import BlogPostCard from '@/components/blog/blog-post-card';
import { fetchPublishedBlogPosts } from '@/lib/supabase/blog';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Stories from the studio, exhibition highlights, and behind-the-scenes notes from Spencer Grey.',
};

export default async function BlogIndexPage() {
  const posts = await fetchPublishedBlogPosts();

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
        <p className="text-xs uppercase tracking-[0.4em] text-[#020312]/50 mb-6">
          Journal
        </p>
        <h1 className="font-serif text-4xl md:text-6xl text-[#020312] mb-6">
          Notes from the studio
        </h1>
        <p className="text-base md:text-lg text-[#020312]/70 leading-relaxed max-w-2xl mx-auto">
          Follow the journey as new collections take shape, special releases come to life, and exhibitions open their doors.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {posts.length === 0 ? (
          <div className="bg-white border border-[#020312]/10 rounded-lg p-10 text-center">
            <h2 className="font-serif text-2xl text-[#020312] mb-3">Stories are on the way</h2>
            <p className="text-sm text-[#020312]/70 max-w-xl mx-auto">
              The journal is launching alongside the art store. Check back soon for studio updates, process insights, and new release announcements.
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
