import type { JSX } from 'react';
import Image from 'next/image';

import type { BlogContentBlock } from '@/types/blog';
import { resolveCoverImage } from './blog-post-card';

function isRichTextBlock(block: BlogContentBlock): block is Extract<BlogContentBlock, { type: 'rich_text' }> {
  return block.type === 'rich_text';
}

export default function BlogPostContent({ blocks }: { blocks: BlogContentBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const richTextBlock = blocks.find(isRichTextBlock);
  if (richTextBlock) {
    return (
      <div
        className="rte"
        dangerouslySetInnerHTML={{ __html: richTextBlock.html }}
      />
    );
  }

  return (
    <div className="rte space-y-12">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level ?? 2;
            const Tag = (`h${Math.min(Math.max(level, 2), 3)}` as keyof JSX.IntrinsicElements);
            return (
              <Tag key={index} className="font-serif text-3xl md:text-[2.75rem] text-[#020312] leading-tight">
                {block.text}
              </Tag>
            );
          }
          case 'paragraph': {
            return (
              <p key={index} className="text-base md:text-lg leading-8">
                {block.text}
              </p>
            );
          }
          case 'quote': {
            return (
              <figure key={index} className="border-l-4 border-[#020312] pl-6 py-6 bg-[#F6F4F0]">
                <blockquote className="font-serif text-2xl md:text-[2rem] text-[#020312] leading-tight">
                  “{block.text}”
                </blockquote>
                {block.attribution && (
                  <figcaption className="mt-4 text-xs uppercase tracking-[0.35em] text-[#020312]/60">
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
                <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg border border-[#020312]/10 bg-[#EDEAE4]">
                  <Image
                    src={imageSrc}
                    alt={block.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 70vw, 100vw"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-sm text-[#020312]/60 leading-relaxed">
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
