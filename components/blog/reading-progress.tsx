"use client";

import { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.querySelector('article');
      if (!article) return;
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = -article.getBoundingClientRect().top;
      setProgress(Math.min(Math.max((scrolled / total) * 100, 0), 100));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-[2px] bg-[#020312] transition-none"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
