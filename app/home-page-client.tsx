"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/artwork/product-card";
import { ensureNumericPrice } from "@/components/artwork/price-helper";
import { useState } from "react";
import ArtworkGrid from "@/components/home/artwork-grid";
import HorizontalScroll from "@/components/ui/horizontal-scroll";

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
interface HomePageClientProps {
  featuredArtworks: Artwork[];
  recentArtworks: Artwork[];
}

/**
 * HomePageClient component
 * Client component for the home page with animations
 * This follows Next.js 15 best practices by keeping animations in client components
 */
/**
 * TabInterface component for the "Why Collect My Art" section
 * Displays three tabs: Limited Prints, Museum Quality, and Print to Order
 */
function TabInterface() {
  const [activeTab, setActiveTab] = useState<'limited' | 'museum' | 'order'>('limited');
  
  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };
  
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
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Tab Content - Limited Prints */}
        {activeTab === 'limited' && (
          <>
            {/* Left Column - Image/Video */}
            <motion.div 
              key="limited-media"
              className="relative aspect-[9/16] md:aspect-[9/16] w-full max-w-[280px] mx-auto md:max-w-[320px] order-1" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="w-full h-full bg-[#F6F4F0]/50 overflow-hidden rounded-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/snapsave.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
            
            {/* Right Column - Description */}
            <motion.div 
              key="limited-content"
              className="space-y-6 order-2" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Limited Edition Prints</h3>
              <p className="text-[#020312] leading-relaxed">
                Each piece of art is part of an exclusive, limited edition collection. Depending on the size, only a specific number of prints are available, and once a total of 150 prints of each artwork are sold, they will never be printed again. This makes every print a rare and special addition to your collection.
              </p>
              <p className="text-[#020312] leading-relaxed">
                Every print is numbered and accompanied by a certificate of authenticity, ensuring the value and exclusivity of your artwork.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block mt-6"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-[#020312]/10 rounded px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  SHOP NOW
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
        
        {/* Tab Content - Museum Quality */}
        {activeTab === 'museum' && (
          <>
            {/* Left Column - Image/Video */}
            <motion.div 
              key="museum-media"
              className="relative aspect-[9/16] md:aspect-[9/16] w-full max-w-[280px] mx-auto md:max-w-[320px] order-1" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="w-full h-full bg-[#F6F4F0]/50 overflow-hidden rounded-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/bright_love.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
            
            {/* Right Column - Description */}
            <motion.div 
              key="museum-content"
              className="space-y-6 order-2" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Museum Quality Materials</h3>
              <p className="text-[#020312] leading-relaxed">
                All prints are crafted using museum-quality materials and giclée printing techniques to ensure vibrant colors and exceptional detail that will last for generations.
              </p>
              <p className="text-[#020312] leading-relaxed">
                We use only premium archival papers and pigment-based inks that resist fading for over 100 years when properly displayed, ensuring your investment maintains its beauty and value over time.
              </p>
              <p className="text-[#020312] leading-relaxed">
                Each print undergoes a rigorous quality control process before shipping to ensure perfect color reproduction and flawless presentation.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block mt-6"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-[#020312]/10 rounded px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  SHOP NOW
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
        
        {/* Tab Content - Print to Order */}
        {activeTab === 'order' && (
          <>
            {/* Left Column - Image/Video */}
            <motion.div 
              key="order-media"
              className="relative aspect-[9/16] md:aspect-[9/16] w-full max-w-[280px] mx-auto md:max-w-[320px] order-1" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="w-full h-full bg-[#F6F4F0]/50 overflow-hidden rounded-lg">
                <Image
                  src="/hero-spencer.jpg"
                  alt="Print to order process"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-md text-sm">
                    Print to Order Video
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Column - Description */}
            <motion.div 
              key="order-content"
              className="space-y-6 order-2" 
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Print to Order Process</h3>
              <p className="text-[#020312] leading-relaxed">
                Every print is made-to-order, meaning it&apos;s freshly printed once you place your order, allowing us to minimize waste and maintain our commitment to sustainability.
              </p>
              <p className="text-[#020312] leading-relaxed">
                This approach ensures that each artwork receives individual attention and care during production, resulting in the highest quality final piece.
              </p>
              <p className="text-[#020312] leading-relaxed">
                Your print will be carefully packaged and shipped directly to your door, typically within 5-7 business days of your order.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block mt-6"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-[#020312]/10 rounded px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  SHOP NOW
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePageClient({ featuredArtworks, recentArtworks }: HomePageClientProps) {
  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, // Increased duration for more noticeable animation
        ease: [0.22, 1, 0.36, 1] // Custom easing for subtle, elegant motion
      }
    }
  };
  
  // Staggered animation variants for child elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animation
        delayChildren: 0.3 // Delay before starting child animations
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.1
      }
    })
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-[#F6F4F0]"
    >
      {/* Minimal Hero Section - "gallery vibes. at home." */}
      <section className="pt-20 pb-0 md:pt-32 md:pb-0 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className=" text-5xl md:text-7xl mb-10 max-w-3xl text-[#020312]" data-component-name="HomePageClient">
            Love Channeled Through Form
          </h1>
          
          {/* Hero Image and Artist Statement */}
          <motion.div 
            className="mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="relative w-full aspect-[16/9] mb-10 overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-[#F6F4F0]/50 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src="/hero-spencer.jpg"
                    alt="Spencer Grey with artwork"
                    fill
                    className="object-cover"
                  />
                  <motion.div 
                    className="absolute top-4 right-4 bg-[#F6F4F0] px-4 py-2 rounded-md shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/shop" className="text-sm font-medium flex items-center text-[#020312]">
                      Shop the Art Prints
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Empty space removed for consistent spacing */}
          </motion.div>
        </div>
      </section>

      {/* Creative Process Section */}
      <section className="py-16 md:py-24 px-6 bg-[#F6F4F0]">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 text-[#020312]">
            &ldquo;Our relationship with transformative power of art to connect us with our deeper selves. My creative process involves layers of intuition, technique, and emotional resonance.&rdquo;
          </blockquote>
          <motion.cite 
            className="text-sm font-medium not-italic text-[#020312]/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From the Studio
          </motion.cite>
        </motion.div>
      </section>
      
      {/* Featured Artworks Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto px-6">
          <ArtworkGrid artworks={featuredArtworks} />
        </div>
      </section>
      
      {/* Recent Artworks Section */}
      <section className="py-16 md:py-24 px-6 bg-[#F6F4F0]">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="font-serif text-3xl md:text-4xl text-center mb-12 text-[#020312]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Recent Artworks
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <HorizontalScroll
              className="pb-2"
              scrollbarTrackClassName="custom-scrollbar-track"
              scrollbarThumbClassName="custom-scrollbar-thumb"
            >
              <div className="flex gap-8 py-2">
                {recentArtworks.map((artwork, index) => (
                  <motion.div 
                    key={artwork.id} 
                    className="min-w-[280px] sm:min-w-[320px] w-[320px] flex-shrink-0 flex flex-col"
                    variants={itemVariants}
                    custom={index as number}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard 
                      id={artwork.id} 
                      title={artwork.title} 
                      images={artwork.images}
                      price={ensureNumericPrice(artwork.price)}
                      className="h-full"
                    />
                  </motion.div>
                ))}
              </div>
            </HorizontalScroll>
          </motion.div>
        </div>
      </section>
      
      {/* Art Collection Features Section - Tabbed Interface */}
      <section className="py-16 md:py-24 px-6 bg-[#e8e8f6]">
        <div className="max-w-7xl mx-auto">
          {/* Tabbed Interface */}
          <TabInterface />
        </div>
      </section>

      {/* Artist Quote */}
      <section className="py-16 md:py-24 px-6">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 text-[#020312]">
            &ldquo;My work is birthed from the delicate balance between chaos and order, finding beauty in the spaces between. Each piece is a meditation on form, color, and texture—an invitation to pause and reflect.&rdquo;
          </blockquote>
          <motion.cite 
            className="text-sm font-medium not-italic text-[#020312]/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Spencer Grey
          </motion.cite>
        </motion.div>
      </section>
    </motion.div>
  );
}
