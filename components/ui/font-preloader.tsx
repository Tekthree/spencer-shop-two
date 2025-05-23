"use client";

import { useEffect } from 'react';

/**
 * FontPreloader component
 * Preloads custom fonts to ensure they're available before rendering
 * @returns null - this component doesn't render anything visible
 */
export default function FontPreloader() {
  useEffect(() => {
    // Create a hidden div with text using the Cardinal Fruit font
    const preloadDiv = document.createElement('div');
    preloadDiv.style.fontFamily = "'Cardinal Fruit', serif";
    preloadDiv.style.position = 'absolute';
    preloadDiv.style.width = '0';
    preloadDiv.style.height = '0';
    preloadDiv.style.overflow = 'hidden';
    preloadDiv.style.visibility = 'hidden';
    preloadDiv.textContent = 'Font Preloader';
    document.body.appendChild(preloadDiv);

    // Create a hidden div with text using the Suisse Intl font
    const preloadDivSans = document.createElement('div');
    preloadDivSans.style.fontFamily = "'Suisse Intl', sans-serif";
    preloadDivSans.style.position = 'absolute';
    preloadDivSans.style.width = '0';
    preloadDivSans.style.height = '0';
    preloadDivSans.style.overflow = 'hidden';
    preloadDivSans.style.visibility = 'hidden';
    preloadDivSans.textContent = 'Font Preloader';
    document.body.appendChild(preloadDivSans);

    // Force font loading
    document.fonts.ready.then(() => {
      console.log('Custom fonts are loaded and ready');
    });

    // Cleanup function
    return () => {
      document.body.removeChild(preloadDiv);
      document.body.removeChild(preloadDivSans);
    };
  }, []);

  return null;
}