import Image from 'next/image';
import type { BlogContentBlock } from '@/types/blog';
import { resolveCoverImage } from './blog-post-card';

export default function BlogPostContent({ blocks }: { blocks: BlogContentBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level ?? 2;
            const Tag = (`h${Math.min(Math.max(level, 2), 3)}` as keyof JSX.IntrinsicElements);
            return (
              <Tag key={index} className="font-serif text-2xl md:text-3xl text-[#020312]">
                {block.text}
              </Tag>
            );
          }
          case 'paragraph': {
            return (
              <p key={index} className="text-base md:text-lg leading-relaxed text-[#020312]/85">
                {block.text}
              </p>
            );
          }
          case 'quote': {
            return (
              <figure key={index} className="border-l-4 border-[#020312] pl-6 py-4 bg-[#F6F4F0]">
                <blockquote className="font-serif text-xl md:text-2xl text-[#020312]">
                  “{block.text}”
                </blockquote>
                {block.attribution && (
                  <figcaption className="mt-4 text-sm uppercase tracking-[0.3em] text-[#020312]/60">
                    {block.attribution}
                  </figcaption>
                )}
              </figure>
            );
          }
          case 'image': {
            const imageSrc = resolveCoverImage(block.url);
            if (!imageSrc) {
              return null;
            }
            return (
              <figure key={index} className="space-y-3">
                <div className="relative aspect-[16/10] md:aspect-[3/2] overflow-hidden rounded-lg bg-[#EDEAE4]">
                  <Image
                    src={imageSrc}
                    alt={block.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 70vw, 100vw"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-sm text-[#020312]/60">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
