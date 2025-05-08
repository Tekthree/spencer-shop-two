"use client";

import { useEffect, useState } from 'react';
import { generateFAQSchema } from '@/lib/seo/schema';

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Component for adding FAQ structured data to the FAQ page
 * This helps search engines understand the FAQ content and potentially display rich snippets
 * @param faqs - Array of FAQ items with questions and answers
 * @returns Script element with JSON-LD data
 */
export default function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  // Use state to ensure this only runs on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate the FAQ schema
  const faqSchema = generateFAQSchema(faqs);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}