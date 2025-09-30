import JsonLd, { artistJsonLd, organizationJsonLd, websiteJsonLd } from './json-ld';

/**
 * Component for adding default JSON-LD structured data to all pages
 * This improves SEO by providing search engines with consistent structured data
 * @returns Default JSON-LD structured data components
 */
export default function DefaultJsonLd() {
  return (
    <>
      <JsonLd id="structured-data-website" data={websiteJsonLd()} />
      <JsonLd id="structured-data-organization" data={organizationJsonLd()} />
      <JsonLd id="structured-data-artist" data={artistJsonLd()} />
    </>
  );
}
