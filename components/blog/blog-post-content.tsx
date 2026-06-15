import type { JSX } from 'react';
import Image from 'next/image';

import type { BlogContentBlock } from '@/types/blog';
import { resolveCoverImage } from './blog-post-card';
import { slugifyHeading, injectHeadingIds } from '@/lib/blog/headings';

function isRichTextBlock(block: BlogContentBlock): block is Extract<BlogContentBlock, { type: 'rich_text' }> {
  return block.type === 'rich_text';
}

export default function BlogPostContent({ blocks }: { blocks: BlogContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  const richTextBlock = blocks.find(isRichTextBlock);
  if (richTextBlock) {
    return (
      <div
        className="rte"
        dangerouslySetInnerHTML={{ __html: injectHeadingIds(richTextBlock.html) }}
      />
    );
  }

  return (
    <div className="rte space-y-10">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level ?? 2;
            const Tag = `h${Math.min(Math.max(level, 2), 3)}` as keyof JSX.IntrinsicElements;
            const id = slugifyHeading(block.text);
            return (
              <Tag key={index} id={id} className="scroll-mt-28">
                {block.text}
              </Tag>
            );
          }

          case 'paragraph':
            return (
              <p key={index}>
                {block.text}
              </p>
            );

          case 'quote':
            return (
              <figure key={index} className="my-12 bg-[#020312] px-10 py-10 relative overflow-hidden">
                <span
                  className="font-serif absolute -top-4 left-6 text-[8rem] leading-none text-white/10 select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <blockquote className="font-serif text-2xl md:text-3xl text-white leading-snug relative z-10">
                  {block.text}
                </blockquote>
                {block.attribution && (
                  <figcaption className="mt-6 text-xs uppercase tracking-[0.3em] text-white/50">
                    {block.attribution}
                  </figcaption>
                )}
              </figure>
            );

          case 'image': {
            const imageSrc = resolveCoverImage(block.url);
            if (!imageSrc) return null;
            return (
              <figure key={index} className="space-y-3">
                <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-[#EDEAE4]">
                  <Image
                    src={imageSrc}
                    alt={block.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 70vw, 100vw"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-sm text-[#020312]/50 leading-relaxed">
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
