"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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
    <div className="border-b border-[#020312]/10">
      <button
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-sm text-[#020312]">{question}</span>
        <span className="ml-4 text-[#020312]/60">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-[#020312]/70 leading-relaxed">
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
      <h2 className="text-lg font-medium mb-6 text-[#020312]">{title}</h2>
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

interface FAQPageClientProps {
  sections: FAQSectionData[];
}

export default function FAQPageClient({ sections }: FAQPageClientProps) {
  // State to track which FAQ items are open
  const [openItems, setOpenItems] = useState<string[]>([]);
  // State to track active section
  const [activeSection, setActiveSection] = useState<string>("");
  // Refs for intersection observer
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const faqSections = sections;

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

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-16 md:py-24 bg-[#F6F4F0]">
      <h1 className="font-serif text-5xl md:text-6xl mb-12 text-[#020312]">FREQUENTLY ASKED QUESTIONS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        {/* Sidebar - Sticky Navigation */}
        <div className="md:sticky md:top-24 self-start h-fit bg-[#F6F4F0]">
          <nav className="space-y-5">
            {faqSections.map((section, index) => {
              const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <div key={index} className="flex items-start group">
                  <span className="inline-block w-5 h-5 rounded-full border border-[#020312]/30 flex items-center justify-center mr-3 text-xs ${activeSection === sectionId ? 'bg-[#020312] text-white border-[#020312]' : ''}">
                    {index + 1}
                  </span>
                  <Link 
                    href={`#${sectionId}`}
                    className={`flex items-center py-2 text-sm hover:text-[#020312] transition-colors ${activeSection === sectionId ? 'text-[#020312] font-medium' : 'text-[#020312]/60'}`}
                  >
                    {section.title}
                  </Link>
                </div>
              );
            })}
          </nav>
          
          <div className="mb-10 space-y-4">
            <h2 className="text-lg font-medium text-[#020312]">FAQ Sections</h2>
            <p className="text-sm text-gray-600 mb-4">
              We&apos;re here to help. Contact us directly for any questions not covered in our FAQ.
            </p>
            <Link 
              href="/contact" 
              className="text-sm text-[#020312] underline hover:no-underline"
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
          <div className="mt-16 pt-8 border-t border-[#020312]/10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-xs">
              <p className="mb-2 text-[#020312]/60">Certificate of Authenticity</p>
              <Link href="/certificate" className="text-[#020312] hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-[#020312]/60">Quality materials and sustainable printing</p>
              <Link href="/quality" className="text-[#020312] hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-[#020312]/60">Customers are our priority</p>
              <Link href="/about" className="text-[#020312] hover:underline">Learn more</Link>
            </div>
            <div className="text-xs">
              <p className="mb-2 text-[#020312]/60">Limited edition prints, No reproductions</p>
              <Link href="/limited-editions" className="text-[#020312] hover:underline">Learn more</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
