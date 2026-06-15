"use client";

import { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/blog/headings';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0 }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#020312]/40">
        In this article
      </p>
      <ul className="space-y-1 border-l border-[#020312]/10">
        {items.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) window.scrollTo({ top: el.offsetTop - 110, behavior: 'smooth' });
              }}
              className={`block py-1.5 text-sm leading-snug transition-colors border-l-2 -ml-px ${
                level === 3 ? 'pl-5' : 'pl-3'
              } ${
                activeId === id
                  ? 'border-[#020312] text-[#020312] font-medium'
                  : 'border-transparent text-[#020312]/45 hover:text-[#020312]/70 hover:border-[#020312]/30'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
