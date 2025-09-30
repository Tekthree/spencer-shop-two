import FAQPageClient from './faq-page-client';
import JsonLd from '@/components/shared/json-ld';
import { generateFAQSchema } from '@/lib/seo/schema';

const faqSections = [
  {
    title: 'General FAQs',
    items: [
      {
        question: "What makes Spencer Grey's art prints special?",
        answer:
          "Spencer Grey's art prints are limited edition, museum-quality giclée prints on 100% cotton rag archival paper. Each print is numbered and signed by the artist, making it a unique collectible piece.",
      },
      {
        question: 'Are these prints really limited edition?',
        answer:
          'Yes, all prints are strictly limited edition. Once an edition sells out, it will never be reprinted in that size again. This ensures the value and exclusivity of your artwork.',
      },
      {
        question: 'Do prints come framed?',
        answer:
          'Our prints are sold unframed to allow you to select framing that matches your space and style. We can recommend professional framers if needed.',
      },
      {
        question: 'How do I know my print is authentic?',
        answer:
          'Each print comes with a signed certificate of authenticity that includes the edition number, title, and artist signature.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long will it take to receive my order?',
        answer:
          'Most orders ship within 5-7 business days. Delivery typically takes an additional 3-5 business days for domestic orders and 7-14 days for international orders.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship worldwide. International shipping rates are calculated at checkout based on destination and package dimensions.',
      },
      {
        question: 'How are prints packaged for shipping?',
        answer:
          'Prints are carefully rolled in acid-free tissue paper, placed in a protective tube, and shipped in a sturdy outer box to ensure they arrive in perfect condition.',
      },
      {
        question: 'Can I track my order?',
        answer: "Yes, you'll receive a tracking number via email once your order ships.",
      },
    ],
  },
  {
    title: 'Returns',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          "We don't accept returns of custom framed prints unless there's damage during shipping. We accept returns within 30 days of delivery if the print is in its original condition. Please contact us before initiating a return.",
      },
      {
        question: 'What if my print arrives damaged?',
        answer:
          "In the rare event that your print arrives damaged, please take photos of the damage and contact us within 48 hours of delivery. We'll arrange a replacement at no additional cost.",
      },
      {
        question: 'Can I exchange my print for a different size?',
        answer:
          'Size exchanges are possible within 14 days of delivery, subject to availability. Please note that there may be a price difference if exchanging for a larger size.',
      },
    ],
  },
  {
    title: 'Payment',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and Apple Pay.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Yes, all payments are processed through Stripe, a PCI-compliant payment processor with bank-level encryption.',
      },
      {
        question: 'Do you offer payment plans?',
        answer:
          'Yes, we offer interest-free payment plans through Affirm for orders over $200. You can select this option at checkout.',
      },
    ],
  },
  {
    title: 'Product Care',
    items: [
      {
        question: 'How should I care for my print?',
        answer:
          'To preserve your print, avoid hanging it in direct sunlight or areas with high humidity. Use acid-free materials for framing and handle prints with clean hands or cotton gloves.',
      },
      {
        question: 'How long will my print last?',
        answer:
          'Our archival-quality prints are rated to last 100+ years without fading when properly displayed and cared for.',
      },
      {
        question: "What's the best way to frame my print?",
        answer:
          'We recommend using UV-protective glass or acrylic, acid-free matting, and archival backing when framing your print. A professional framer can help you select the best options.',
      },
    ],
  },
];

const allFAQs = faqSections.flatMap((section) =>
  section.items.map((item) => ({ question: item.question, answer: item.answer }))
);

export default function FAQPage() {
  return (
    <>
      <JsonLd id="faq-schema" data={generateFAQSchema(allFAQs)} />
      <FAQPageClient sections={faqSections} />
    </>
  );
}
