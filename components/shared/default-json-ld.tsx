"use client";

import { usePathname } from 'next/navigation';
import JsonLd, { websiteJsonLd, organizationJsonLd } from './json-ld';

/**
 * Component for adding default JSON-LD structured data to all pages
 * This improves SEO by providing search engines with consistent structured data
 * @returns Default JSON-LD structured data components
 */
export default function DefaultJsonLd() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <>
      {/* Add website structured data */}
      <JsonLd data={websiteJsonLd()} />
      
      {/* Add organization structured data */}
      <JsonLd data={organizationJsonLd()} />
    </>
  );
}