"use client";

import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/artwork/product-card";
import { ensureNumericPrice } from "@/components/artwork/price-helper";
import { useState } from "react";

// Define types for artwork data
type ArtworkImage = {
  url: string;
  alt: string;
  type?: string;
};

type ArtworkSize = {
  size: string;
  price: number;
  dimensions?: string;
};

type Artwork = {
  id: string;
  title: string;
  price: string | number;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  tag?: string;
  hidePrice?: boolean;
};

// Define the props interface for the client component
interface HomePageStaticProps {
  featuredArtworks: Artwork[];
  recentArtworks: Artwork[];
}

/**
 * TabInterface component for the "Why Collect My Art" section
 * Displays three tabs: Limited Prints, Museum Quality, and Print to Order
 * Static version without animations
 */
function TabInterface() {
  const [activeTab, setActiveTab] = useState<'limited' | 'museum' | 'order'>('limited');
  
  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex flex-col md:flex-row justify-center mb-12">
        <div className="grid grid-cols-3 md:flex md:space-x-12 items-center">
          {/* Limited Prints Tab */}
          <button 
            className={`flex flex-col items-center space-y-2 ${activeTab === 'limited' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setActiveTab('limited')}
          >
            <div className="flex items-center justify-center w-10 h-10 border border-[#020312]/10 rounded-full">
              <span className="font-serif">1</span>
            </div>
            <h3 className={`font-serif text-base md:text-xl ${activeTab === 'limited' ? 'underline font-medium' : ''}`}>
              <span className="md:hidden">LIMITED<br />PRINTS</span>
              <span className="hidden md:inline">LIMITED PRINTS</span>
            </h3>
          </button>
          
          {/* Museum Quality Tab */}
          <button 
            className={`flex flex-col items-center space-y-2 ${activeTab === 'museum' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setActiveTab('museum')}
          >
            <div className="flex items-center justify-center w-10 h-10 border border-[#020312]/10 rounded-full">
              <span className="font-serif">2</span>
            </div>
            <h3 className={`font-serif text-base md:text-xl ${activeTab === 'museum' ? 'underline font-medium' : ''}`}>
              <span className="md:hidden">MUSEUM<br />QUALITY</span>
              <span className="hidden md:inline">MUSEUM QUALITY</span>
            </h3>
          </button>
          
          {/* Print to Order Tab */}
          <button 
            className={`flex flex-col items-center space-y-2 ${activeTab === 'order' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setActiveTab('order')}
          >
            <div className="flex items-center justify-center w-10 h-10 border border-[#020312]/10 rounded-full">
              <span className="font-serif">3</span>
            </div>
            <h3 className={`font-serif text-base md:text-xl ${activeTab === 'order' ? 'underline font-medium' : ''}`}>
              <span className="md:hidden">PRINT TO<br />ORDER</span>
              <span className="hidden md:inline">PRINT TO ORDER</span>
            </h3>
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {/* Limited Prints Content */}
        {activeTab === 'limited' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square relative overflow-hidden mb-6">
                <Image
                  src="/images/features/limited-prints.jpg"
                  alt="Limited Edition Art Print"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Numbered and signed by the artist</p>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Limited Edition Prints</h3>
              <p className="mb-6 text-[#020312]/80">
                Each artwork is released in a strictly limited edition, typically between 10-25 prints. Once sold out, the edition is permanently closed, ensuring the value and exclusivity of your investment.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Each print is individually numbered (e.g., 3/25)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hand-signed by Spencer Grey</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Includes certificate of authenticity</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Museum Quality Content */}
        {activeTab === 'museum' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square relative overflow-hidden mb-6">
                <Image
                  src="/images/features/museum-quality.jpg"
                  alt="Museum Quality Art Print"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Archival materials rated to last 100+ years</p>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Museum-Quality Materials</h3>
              <p className="mb-6 text-[#020312]/80">
                I use only the highest quality archival papers and pigment-based inks that resist fading for generations. My prints meet the same standards used by leading museums and galleries worldwide.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% acid-free cotton rag paper (310gsm)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Archival pigment-based inks with 100+ year rating</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Color-matched to artist&apos;s original work</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Print to Order Content */}
        {activeTab === 'order' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square relative overflow-hidden mb-6">
                <Image
                  src="/images/features/print-to-order.jpg"
                  alt="Print to Order Process"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Sustainable production with minimal waste</p>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Print-to-Order Process</h3>
              <p className="mb-6 text-[#020312]/80">
                Each print is created specifically for you when ordered. This sustainable approach eliminates waste and ensures your artwork receives individual attention and quality control.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Printed, inspected, and shipped within 3-5 business days</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Zero inventory waste and minimal environmental impact</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#020312]/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Each print receives personal quality inspection</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * HomePageStatic component
 * Static version of the home page without animations
 * This follows our new style guide approach
 */
export default function HomePageStatic({ featuredArtworks, recentArtworks }: HomePageStaticProps) {
  return (
    <div className="bg-[#F6F4F0]">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image
            src="/images/hero-image.jpg"
            alt="Spencer Grey Art - Minimalist abstract artwork"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6">
              Spencer Grey
            </h1>
            <p className="text-white/90 max-w-xl mx-auto mb-8 text-lg md:text-xl">
              Limited Edition Fine Art Prints
            </p>
            <Link 
              href="/shop"
              className="inline-block bg-white text-[#020312] px-8 py-3 font-serif uppercase tracking-wider hover:bg-[#020312] hover:text-white transition-colors"
            >
              Shop the Art Prints
            </Link>
          </div>
        </div>
      </section>
      
      {/* Artist Statement */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-[#020312]">
            My work explores the delicate balance between structure and fluidity, creating spaces where viewers can find their own meaning and connection. Each piece is a meditation on form, color, and the subtle interplay of light.
          </p>
        </div>
      </section>
      
      {/* Featured Artworks Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#020312]">Featured Collection</h2>
            <p className="text-[#020312]/70 max-w-2xl mx-auto">
              Explore my signature works, each created with meticulous attention to detail and printed on museum-quality materials.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredArtworks.map((artwork) => (
              <div key={artwork.id}>
                <ProductCard 
                  id={artwork.id}
                  title={artwork.title}
                  price={ensureNumericPrice(artwork.price)}
                  images={artwork.images}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/shop"
              className="inline-block border-2 border-[#020312]/10 rounded px-8 py-4 hover:bg-black hover:text-white transition-colors uppercase font-medium tracking-wide text-[#020312]"
            >
              View All Artworks
            </Link>
          </div>
        </div>
      </section>
      
      {/* Recent Artworks Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#020312]">Latest Releases</h2>
            <p className="text-[#020312]/70 max-w-2xl mx-auto">
              Discover my most recent work, fresh from the studio and ready to transform your space.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentArtworks.map((artwork) => (
              <div key={artwork.id} className="relative">
                <ProductCard 
                  id={artwork.id}
                  title={artwork.title}
                  price={ensureNumericPrice(artwork.price)}
                  images={artwork.images}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Art Collection Features Section - Tabbed Interface */}
      <section className="py-24 md:py-32 px-6 bg-[#e8e8f6]">
        <div className="max-w-7xl mx-auto">
          {/* Tabbed Interface */}
          <TabInterface />
        </div>
      </section>

      {/* Artist Quote */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 text-[#020312]">
            &ldquo;My work explores the delicate balance between chaos and order, finding beauty in the spaces between. Each piece is a meditation on form, color, and texture&mdash;an invitation to pause and reflect.&rdquo;
          </blockquote>
          <cite className="text-sm font-medium not-italic text-[#020312]/70">
            Spencer Grey
          </cite>
        </div>
      </section>
    </div>
  );
}
