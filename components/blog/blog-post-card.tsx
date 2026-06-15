import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import type { BlogPost } from '@/types/blog';

export function resolveCoverImage(src?: string) {
  if (!src) {
    return null;
  }

  if (src.startsWith('http') || src.startsWith('/')) {
    return src;
  }

  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!baseUrl) {
    return `/${src}`;
  }

  return `${baseUrl}/${src}`;
}

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const { slug, title, excerpt, category, cover_image, cover_image_alt, read_time_minutes, published_at } = post;
  const imageSrc = resolveCoverImage(cover_image);
  const imageAlt = cover_image_alt || title;
  const publishedDate = published_at ? new Date(published_at) : null;
  const formattedDate = publishedDate ? format(publishedDate, 'MMMM d, yyyy') : undefined;

  return (
    <article className="group">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#EDEAE4]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, 100vw"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              Image coming soon
            </div>
          )}
        </div>
        <div className="mt-6 space-y-3">
          {category && (
            <span className="text-xs tracking-[0.3em] text-[#020312]/60 uppercase">
              {category}
            </span>
          )}
          <h3 className="font-serif text-2xl leading-snug text-[#020312] group-hover:underline">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-[#020312]/70 leading-relaxed">
              {excerpt}
            </p>
          )}
          <div className="text-xs text-[#020312]/60 uppercase tracking-[0.3em]">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && read_time_minutes && <span> • </span>}
            {read_time_minutes && <span>{read_time_minutes} min read</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
