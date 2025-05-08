"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FAQSchema from './faq-schema';

// FAQ item type definition
type FAQItem = {
  question: string;
  answer: string;
};

// FAQ section type definition
type FAQSectionData = {
  title: string;
  items: FAQItem[];
};

// Props for FAQSectionComponent
type FAQSectionProps = {
  title: string;
  items: FAQItem[];
  openItems: string[];
  toggleItem: (id: string) => void;
};

// Component for individual FAQ item with accordion functionality
const FAQAccordionItem = ({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-sm">{question}</span>
        <span className="ml-4 text-gray-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Component for a section of FAQs
const FAQSection = ({ title, items, openItems, toggleItem }: FAQSectionProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-lg font-normal mb-6">{title}</h2>
      <div className="space-y-0">
        {items.map((item, index) => (
          <FAQAccordionItem
            key={`${title}-${index}`}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.includes(`${title}-${index}`)}
            onClick={() => toggleItem(`${title}-${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default function FAQPage() {
  // State to track which FAQ items are open
  const [openItems, setOpenItems] = useState<string[]>([]);
  // State to track active section
  const [activeSection, setActiveSection] = useState<string>("");
  // Refs for intersection observer
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // FAQ data
  const faqSections: FAQSectionData[] = [
    {
      title: "General FAQs",
      items: [
        {
          question: "What makes Spencer Grey's art prints special?",
          answer: "Spencer Grey's art prints are limited edition, museum-quality giclée prints on 100% cotton rag archival paper. Each print is numbered and signed by the artist, making it a unique collectible piece."
        },
        {
          question: "Are these prints really limited edition?",
          answer: "Yes, all prints are strictly limited edition. Once an edition sells out, it will never be reprinted in that size again. This ensures the value and exclusivity of your artwork."
        },
        {
          question: "Do prints come framed?",
          answer: "Our prints are sold unframed to allow you to select framing that matches your space and style. We can recommend professional framers if needed."
        },
        {
          question: "How do I know my print is authentic?",
          answer: "Each print comes with a signed certificate of authenticity that includes the edition number, title, and artist signature."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      items: [
        {
          question: "How long will it take to receive my order?",
          answer: "Most orders ship within 5-7 business days. Delivery typically takes an additional 3-5 business days for domestic orders and 7-14 days for international orders."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship worldwide. International shipping rates are calculated at checkout based on destination and package dimensions."
        },
        {
          question: "How are prints packaged for shipping?",
          answer: "Prints are carefully rolled in acid-free tissue paper, placed in a protective tube, and shipped in a sturdy outer box to ensure they arrive in perfect condition."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, you'll receive a tracking number via email once your order ships."
        }
      ]
    },
    {
      title: "Returns",
      items: [
        {
          question: "What is your return policy?",
          answer: "We don&apos;t accept returns of custom framed prints unless there&apos;s damage during shipping. We accept returns within 30 days of delivery if the print is in its original condition. Please contact us before initiating a return."
        },
        {
          question: "What if my print arrives damaged?",
          answer: "In the rare event that your print arrives damaged, please take photos of the damage and contact us within 48 hours of delivery. We'll arrange a replacement at no additional cost."
        },
        {
          question: "Can I exchange my print for a different size?",
          answer: "Size exchanges are possible within 14 days of delivery, subject to availability. Please note that there may be a price difference if exchanging for a larger size."
        }
      ]
    },
    {
      title: "Payment",
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and Apple Pay."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, all payments are processed through Stripe, a PCI-compliant payment processor with bank-level encryption."
        },
        {
          question: "Do you offer payment plans?",
          answer: "Yes, we offer interest-free payment plans through Affirm for orders over $200. You can select this option at checkout."
        }
      ]
    },
    {
      title: "Product Care",
      items: [
        {
          question: "How should I care for my print?",
          answer: "To preserve your print, avoid hanging it in direct sunlight or areas with high humidity. Use acid-free materials for framing and handle prints with clean hands or cotton gloves."
        },
        {
          question: "How long will my print last?",
          answer: "Our archival-quality prints are rated to last 100+ years without fading when properly displayed and cared for."
        },
        {
          question: "What's the best way to frame my print?",
          answer: "We recommend using UV-protective glass or acrylic, acid-free matting, and archival backing when framing your print. A professional framer can help you select the best options."
        }
      ]
    }
  ];

  // Toggle FAQ item open/closed
  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Set up intersection observer to detect active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the section ID from the element
            const id = entry.target.id;
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    // Observe all section elements
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      // Cleanup: unobserve all sections
      Object.values(currentRefs).forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [setActiveSection, sectionRefs]);

  // Flatten all FAQ items for structured data
  const allFAQs = faqSections.flatMap(section => 
    section.items.map(item => ({
      question: item.question,
      answer: item.answer
    }))
  );

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Add structured data for FAQs */}
      <FAQSchema faqs={allFAQs} />
      
      <h1 className="text-3xl font-normal mb-8">Frequently Asked Questions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
        {/* Sidebar - Sticky Navigation */}
        <div className="md:col-span-1 md:sticky md:top-8 md:self-start h-fit">
          <nav className="space-y-5">
            {faqSections.map((section, index) => {
              const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <div key={index} className="flex items-start group">
                  <span className="font-serif text-sm text-gray-400 mr-3">{index + 1}</span>
                  <Link 
                    href={`#${sectionId}`}
                    className={`block text-sm transition-colors ${activeSection === sectionId ? 'text-black' : 'text-gray-500 group-hover:text-gray-800'}`}
                  >
                    {section.title}
                  </Link>
                </div>
              );
            })}
          </nav>
          
          <div className="mt-12 p-6 bg-gray-50">
            <h3 className="text-sm font-medium mb-4">Still have questions?</h3>
            <p className="text-sm text-gray-600 mb-4">
              We&apos;re here to help. Contact us directly for any questions not covered in our FAQ.
            </p>
            <Link 
              href="/contact" 
              className="text-sm text-black underline hover:no-underline"
            >
              Contact us directly
            </Link>
          </div>
        </div>
        
        {/* FAQ Content */}
        <div className="md:col-span-2">
          {faqSections.map((section, index) => {
            const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
            return (
              <div 
                key={index} 
                id={sectionId}
                ref={el => { sectionRefs.current[sectionId] = el; }}
              >
                <FAQSection 
                  title={section.title} 
                  items={section.items} 
                  openItems={openItems}
                  toggleItem={toggleItem}
                />
              </div>
            );
          })}
          
          {/* Footer links */}
          <div className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-xs">
              <p className="mb-2 text-gray-500">Certificate of Authenticity</p>
              <Link href="/certificate" className="text-black hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-gray-500">Quality materials and sustainable printing</p>
              <Link href="/quality" className="text-black hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-gray-500">Customers are our priority</p>
              <Link href="/about" className="text-black hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-gray-500">Limited edition prints, No reproductions</p>
              <Link href="/limited-editions" className="text-black hover:underline">Learn more</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}