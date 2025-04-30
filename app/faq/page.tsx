"use client";

import { useState, useEffect, useRef } from 'react';
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
  // Refs for section elements
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Toggle FAQ item open/closed
  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -70% 0px", // Adjust this to control when the active section changes
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all section elements
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // FAQ data organized by sections
  const faqSections: FAQSectionData[] = [
    {
      title: "GENERAL FAQS",
      items: [
        {
          question: "What materials are used in your art prints?",
          answer: "Our prints emerge from a harmonious fusion of archival-grade papers and vibrant pigment inks that dance with light. We select only premium materials that ensure your artwork maintains its radiance and essence for generations, with each piece carrying the energetic quality of museum-standard presentation."
        },
        {
          question: "Are the prints limited editions?",
          answer: "Yes, our prints exist as finite expressions in the material realm. Each edition is mindfully limited to preserve its uniqueness and value, with each print individually numbered and accompanied by a certificate of authenticity that validates its place in the cosmic sequence."
        },
        {
          question: "Can I purchase a digital version of the artwork?",
          answer: "Currently, we offer only physical manifestations of our creative expressions. The tangible presence of art creates a different resonance within your space than digital forms, though we're exploring future possibilities for digital editions."
        },
        {
          question: "Do you offer custom sizes for the prints?",
          answer: "Yes, we can accommodate your spatial requirements. Please contact us with your desired dimensions, and we'll create a personalized quote for your custom-sized print that aligns perfectly with your environment."
        },
        {
          question: "Are the colors on the print exactly as shown on the website?",
          answer: "While we strive for precise representation, the digital realm and physical world sometimes interpret colors differently. Our professional calibration minimizes these variations, but subtle differences may occur due to screen settings and the natural properties of pigment on paper."
        },
        {
          question: "How are the prints packaged to ensure they arrive safely?",
          answer: "Each print undertakes its journey to you in protective materials - acid-free tissue, rigid cardboard backing, water-resistant outer packaging, and reinforced corners. We treat each shipment as a sacred vessel carrying creative energy to your doorstep."
        }
      ]
    },
    {
      title: "SHIPPING & DELIVERY",
      items: [
        {
          question: "Do you offer free shipping?",
          answer: "Yes, we offer free standard shipping on all orders within the USA, EU and UK regions. This offering allows the art to flow freely to you without additional barriers."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, our art travels across boundaries and borders. International shipping is available to most countries, with costs calculated based on destination and package dimensions at checkout."
        },
        {
          question: "When will my order ship?",
          answer: "Most orders begin their journey within 3-5 business days. Limited editions and custom sizes may require 7-10 days of preparation before embarking to your space."
        },
        {
          question: "Will I get a tracking number?",
          answer: "Yes, you'll receive a digital thread to follow your art's journey. Once your order ships, we'll send tracking information to your email address, allowing you to witness its progress toward you."
        },
        {
          question: "How long does shipping take?",
          answer: "Shipping times vary by destination. Domestic deliveries typically arrive within 3-7 business days after shipping, while international journeys may require 7-21 days depending on customs processing and local delivery services."
        },
        {
          question: "What shipping carriers do you use?",
          answer: "We partner with respected carriers including FedEx, UPS, and DHL for international shipments, selecting the most reliable option for your specific location to ensure safe passage of your artwork."
        }
      ]
    },
    {
      title: "RETURNS",
      items: [
        {
          question: "What is your return policy?",
          answer: "We honor your right to return prints in pristine condition within 30 days of their arrival in your realm. Please note that custom-sized prints and commissioned works exist in a different category and cannot be returned unless damaged during transit."
        },
        {
          question: "Can I exchange a print for a different artwork?",
          answer: "Yes, exchanges are possible within our 30-day return window. Contact us to initiate the exchange process, and we'll guide you through returning your current print and selecting your new artistic connection."
        },
        {
          question: "How do I initiate a return?",
          answer: "The return journey begins by contacting us through our online form. Once approved, we'll provide instructions for safe return packaging and the destination address for your shipment."
        },
        {
          question: "Will I receive a refund for the shipping costs?",
          answer: "Original shipping costs are non-refundable unless the return is due to our error or damaged goods. We believe in transparent energy exchange throughout our relationship."
        }
      ]
    },
    {
      title: "PAYMENT",
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We welcome various forms of energy exchange including major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay, ensuring secure and convenient transactions."
        },
        {
          question: "Is my payment information secure?",
          answer: "Absolutely. Your financial information travels through encrypted pathways and secure processing systems. We never store your complete card details in our database, honoring both your trust and privacy."
        },
        {
          question: "Can I pay in installments or use a payment plan?",
          answer: "Yes, we offer installment options through Affirm for orders over $200, allowing you to bring artwork into your space while spreading the financial commitment across time in a way that honors your resources."
        },
        {
          question: "How do I apply a discount code?",
          answer: "During the checkout journey, you'll find a field labeled 'Discount Code' where you can enter your code. The system will automatically adjust your total to reflect the appropriate discount before finalizing your purchase."
        }
      ]
    },
    {
      title: "PRODUCT CARE",
      items: [
        {
          question: "How do I care for my art print?",
          answer: "Treat your print as a living entity deserving mindful attention. Display away from direct sunlight, extreme temperature fluctuations, and moisture. When handling, touch only the edges with clean hands, acknowledging the sensitive nature of fine art papers."
        },
        {
          question: "What is the best way to frame the prints?",
          answer: "We recommend professional framing with acid-free mats and UV-protective glass to preserve the print's vibrancy. This creates both physical protection and an energetic boundary that honors the artwork's presence in your space."
        },
        {
          question: "Will the colors fade over time?",
          answer: "Our archival pigment inks are designed to resist fading for many cycles of the sun. Under proper care and display conditions, the prints will maintain their vivid essence for 80-100 years, allowing generations to experience their beauty."
        },
        {
          question: "How should I clean the print if it becomes dusty?",
          answer: "For framed prints behind glass, simply use a lint-free cloth with glass cleaner applied to the cloth (never directly to the glass). For unframed prints, gently dust using a clean, soft brush designed for artwork, always moving from the center outward with minimal pressure."
        }
      ]
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
        {/* Sidebar - Sticky Navigation */}
        <div className="md:col-span-1 md:sticky md:top-8 md:self-start h-fit">
          <h1 className="font-serif text-2xl mb-10">Frequently Asked Questions</h1>
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
          
          <div className="mt-12 pt-12 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Can&apos;t find what you&apos;re looking for?
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
