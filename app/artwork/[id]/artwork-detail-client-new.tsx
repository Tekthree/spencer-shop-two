"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import RelatedArtworks from '@/components/artwork/related-artworks';

// Define TypeScript interfaces for our data models
interface SizeOption {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface ArtworkImage {
  url: string;
  alt: string;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  collection_name?: string;
  featured: boolean;
  images: ArtworkImage[];
  sizes: SizeOption[];
  created_at: string;
}

interface ArtworkDetailClientProps {
  artwork: Artwork | null;
  error: string | null;
  formatPrice: (cents: number) => string;
  isAvailable: (size: SizeOption) => boolean;
  handleSizeSelect: (size: SizeOption) => void;
  handleAddToCart: () => void;
  selectedSize: SizeOption | null;
  isNewRelease?: boolean; // Flag to indicate if this is a new release (within last 30 days)
}

/**
 * Artwork Detail Client Component
 * Handles animations and rendering of the artwork detail page with stacked images
 * and sticky product information, similar to Roburico.com
 */
export default function ArtworkDetailClient({
  artwork,
  error,
  formatPrice,
  isAvailable,
  handleSizeSelect,
  handleAddToCart,
  selectedSize,
  isNewRelease = false
}: ArtworkDetailClientProps) {
  // Create refs for sticky behavior
  const productInfoRef = useRef<HTMLDivElement>(null);
  
  // State for expandable sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Use useEffect to handle any side effects
  useEffect(() => {
    // You could add scroll behavior here if needed
    return () => {
      // Cleanup if necessary
    };
  }, []);

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Staggered animation variants for child elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
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
        delay: i * 0.08
      }
    })
  };

  // If there's an error, display it
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-700">{error}</p>
          <Link href="/" className="text-red-700 underline mt-2 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  // If artwork is null (shouldn't happen with the loading state), return nothing
  if (!artwork) {
    return null;
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Stacked Artwork Images */}
        <div className="space-y-8">
          {artwork.images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square w-full overflow-hidden rounded-lg"
            >
              <Image
                src={image.url}
                alt={image.alt || `${artwork.title} - Image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        
        {/* Right Column - Sticky Product Info */}
        <div className="relative">
          <motion.div 
            ref={productInfoRef}
            className="sticky top-24 space-y-6"
            variants={containerVariants}
          >
            {/* New Release Badge */}
            {isNewRelease && (
              <motion.div 
                variants={itemVariants}
                className="inline-block bg-orange-500 text-white px-3 py-1 text-sm font-medium mb-4"
              >
                JUST DROPPED
              </motion.div>
            )}
            
            {/* Title and Year */}
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-medium">{artwork.title}</h1>
              <p className="text-gray-500">{artwork.year}</p>
            </motion.div>
            
            {/* Price */}
            <motion.div variants={itemVariants}>
              <p className="text-2xl">{formatPrice(selectedSize?.price || artwork.sizes[0]?.price)}</p>
            </motion.div>
            
            {/* Size Selection */}
            <motion.div variants={itemVariants}>
              <h3 className="font-medium mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {artwork.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`border p-3 text-sm ${selectedSize?.size === size.size ? 'border-black bg-black text-white' : 'border-gray-200'} ${!isAvailable(size) ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
                    onClick={() => isAvailable(size) && handleSizeSelect(size)}
                    disabled={!isAvailable(size)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span>{size.size}</span>
                      {!isAvailable(size) && <span className="text-red-500 text-xs">Sold Out</span>}
                    </div>
                    <div className={`${selectedSize?.size === size.size ? 'text-white' : 'text-gray-500'}`}>{formatPrice(size.price)}</div>
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Add to Cart Button */}
            <motion.div variants={itemVariants}>
              <button
                className={`w-full py-4 px-6 ${selectedSize && isAvailable(selectedSize) ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                onClick={handleAddToCart}
                disabled={!selectedSize || !isAvailable(selectedSize)}
              >
                {selectedSize && isAvailable(selectedSize) ? 'ADD TO CART' : 'Select a Size'}
              </button>
            </motion.div>
            
            {/* Product Features */}
            <motion.div variants={containerVariants} className="space-y-4 pt-6">
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Limited edition — Only {artwork.sizes[0]?.edition_limit || 'N/A'} prints available. No restocks, ever.</p>
              </motion.div>
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Signed and Numbered — Own a truly exclusive piece.</p>
              </motion.div>
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={2}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Certificate of Authenticity included — Proof that your artwork is an original from the artist.</p>
              </motion.div>
            </motion.div>
            
            {/* Expandable Sections */}
            <div className="space-y-4 pt-6">
              {/* About the Piece */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  className="flex justify-between items-center w-full text-left" 
                  onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                >
                  <span className="font-medium">About the Piece</span>
                  <span>{expandedSection === 'about' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'about' && (
                  <div className="pt-4 prose prose-sm max-w-none">
                    <p>{artwork.description}</p>
                    {artwork.collection_name && (
                      <p className="text-sm text-gray-500 mt-2">
                        From the <Link href={`/collections/${artwork.collection_id}`} className="underline">{artwork.collection_name}</Link> collection
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Details & Specs */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  className="flex justify-between items-center w-full text-left" 
                  onClick={() => setExpandedSection(expandedSection === 'details' ? null : 'details')}
                >
                  <span className="font-medium">Details & Specs</span>
                  <span>{expandedSection === 'details' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'details' && (
                  <div className="pt-4 prose prose-sm max-w-none space-y-2">
                    <p><span className="font-medium">Medium:</span> {artwork.medium}</p>
                    <p><span className="font-medium">Year:</span> {artwork.year}</p>
                    <p><span className="font-medium">Handcrafted Art:</span> No AI, just 40+ hours of painting in every detail.</p>
                    <p><span className="font-medium">Museum-Grade Prints:</span> Built to last 100+ years. HD Giclée print on 310 g/m2 Hahnemühle German Etching paper.</p>
                    <p><span className="font-medium">Ready to frame, no matting needed:</span> Each print includes a white border, perfectly centering the artwork to stand out more prominently.</p>
                  </div>
                )}
              </div>
              
              {/* Shipping & Returns */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  className="flex justify-between items-center w-full text-left" 
                  onClick={() => setExpandedSection(expandedSection === 'shipping' ? null : 'shipping')}
                >
                  <span className="font-medium">Shipping & Returns</span>
                  <span>{expandedSection === 'shipping' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'shipping' && (
                  <div className="pt-4 prose prose-sm max-w-none space-y-2">
                    <p><span className="font-medium">Free shipping:</span> All orders ship free.</p>
                    <p><span className="font-medium">Shipping time:</span> Shipped in 5-7 business days.</p>
                    <p><span className="font-medium">No import fees:</span> Shipped from USA, UK, and EU.</p>
                    <p><span className="font-medium">Returns:</span> We accept returns within 30 days of delivery.</p>
                  </div>
                )}
              </div>
              
              {/* Customer Care */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  className="flex justify-between items-center w-full text-left" 
                  onClick={() => setExpandedSection(expandedSection === 'care' ? null : 'care')}
                >
                  <span className="font-medium">Customer Care</span>
                  <span>{expandedSection === 'care' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'care' && (
                  <div className="pt-4 prose prose-sm max-w-none">
                    <p>Have questions? Email us at <a href="mailto:support@spencergrey.com" className="underline">support@spencergrey.com</a> or visit our <Link href="/faq" className="underline">FAQ page</Link>.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Share Button */}
            <div className="pt-6 border-t border-gray-200">
              <button 
                className="flex items-center text-sm text-gray-500 hover:text-black"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: artwork.title,
                      text: `Check out ${artwork.title} by Spencer Grey`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                SHARE WITH A FRIEND
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Related Artworks */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className="mt-24"
      >
        <RelatedArtworks 
          currentArtworkId={artwork.id} 
          collectionId={artwork.collection_id} 
          limit={4}
        />
      </motion.div>
    </motion.div>
  );
}
