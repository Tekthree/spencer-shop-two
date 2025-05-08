"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import RelatedArtworks from '@/components/artwork/related-artworks';
import JsonLd, { productJsonLd, breadcrumbJsonLd } from '@/components/shared/json-ld';
import SocialShare from '@/components/shared/social-share';

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
  handleAddToCart: (quantity?: number) => void;
  selectedSize: SizeOption | null;
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
  selectedSize
}: ArtworkDetailClientProps) {
  // Create refs for sticky behavior
  const productInfoRef = useRef<HTMLDivElement>(null);
  
  // State for expandable sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // State for tracking current image in mobile carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // State for tracking quantity
  const [quantity, setQuantity] = useState(1);

  // Use useEffect to handle any side effects
  useEffect(() => {
    // You could add scroll behavior here if needed
    return () => {
      // Cleanup if necessary
    };
  }, []);

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-medium mb-4">Error Loading Artwork</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link href="/shop" className="inline-block bg-black text-white px-6 py-3">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Handle case where artwork is null
  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-medium mb-4">Artwork Not Found</h1>
        <p className="text-gray-600 mb-8">The artwork you&apos;re looking for could not be found.</p>
        <Link href="/shop" className="inline-block bg-black text-white px-6 py-3">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Handle next image in mobile carousel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length);
  };

  // Handle previous image in mobile carousel
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + artwork.images.length) % artwork.images.length);
  };
  
  // Determine if the artwork was recently added (within the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const wasRecentlyAdded = new Date(artwork.created_at) > thirtyDaysAgo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 max-w-7xl"
    >
      {/* Add JSON-LD structured data for rich search results */}
      <JsonLd data={productJsonLd(artwork)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: artwork.collection_name || 'Artworks', url: artwork.collection_id ? `/collections/${artwork.collection_id}` : '/shop' },
        { name: artwork.title, url: `/artwork/${artwork.id}` },
      ])} />

      {/* Breadcrumb Navigation */}
      <nav className="mb-8 text-sm">
        <ol className="flex flex-wrap items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-black">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/shop" className="text-gray-500 hover:text-black">
              Shop
            </Link>
          </li>
          {artwork.collection_name && (
            <>
              <li className="text-gray-400">/</li>
              <li>
                <Link 
                  href={artwork.collection_id ? `/collections/${artwork.collection_id}` : '/shop'} 
                  className="text-gray-500 hover:text-black"
                >
                  {artwork.collection_name}
                </Link>
              </li>
            </>
          )}
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{artwork.title}</li>
        </ol>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Stacked Images */}
        <div className="space-y-8">
          {/* Mobile Carousel - Only visible on small screens */}
          <div className="relative md:hidden">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <Image
                src={artwork.images[currentImageIndex].url}
                alt={artwork.images[currentImageIndex].alt || artwork.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Dot Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {artwork.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Desktop Stacked Images - Hidden on mobile */}
          <div className="hidden md:block space-y-8">
            {artwork.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative aspect-square overflow-hidden bg-gray-100"
              >
                <Image
                  src={image.url}
                  alt={image.alt || artwork.title}
                  fill
                  sizes="50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Sticky Product Information */}
        <div className="relative">
          <motion.div 
            ref={productInfoRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-24 space-y-6"
          >

            
            {/* Title and Price */}
            <div className="flex justify-between items-baseline mb-4 pb-4 border-b border-gray-200">
              <h1 className="text-2xl font-medium mb-2">
                {artwork.title}
                {wasRecentlyAdded && <span className="ml-2 text-xs bg-black text-white px-2 py-1 inline-block">JUST DROPPED</span>}
              </h1>
              <div className="text-2xl">
                {selectedSize ? (
                  formatPrice(selectedSize.price)
                ) : (
                  artwork.sizes && artwork.sizes.length > 0 ? formatPrice(artwork.sizes[0].price) : "Price unavailable"
                )}
              </div>
            </div>
            
            {/* Selling Points */}
            <div className="space-y-3 py-4 border-b border-gray-200 mb-6">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Limited edition</span> — Only {artwork.sizes[0]?.edition_limit || 150} prints available. No restocks, ever.</p>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Signed and Numbered</span> — Own a truly exclusive piece.</p>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Certificate of Authenticity included</span> — Proof that your artwork is an original from the artist.</p>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Handcrafted Art</span> — No AI, just 40+ hours of passion in every detail.</p>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Museum-Grade Prints</span> — Built to last 100+ years. HD Giclée print on 310 g/m2 Hahnemühle German Etching paper.</p>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm"><span className="font-bold">Ready to frame, no matting needed</span> — Each print includes a white border, perfectly centering the artwork to stand out more prominently.</p>
              </div>
            </div>
            

            
            {/* Size Selection */}
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Size: {selectedSize?.size || 'Select a size'}</p>
                <button className="text-sm underline">SIZE GUIDE</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {artwork.sizes.map((size) => (
                  <button
                    key={size.size}
                    className={`border py-2 px-1 text-sm ${selectedSize?.size === size.size ? 'border-black' : 'border-gray-300'} ${!isAvailable(size) ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
                    onClick={() => isAvailable(size) && handleSizeSelect(size)}
                    disabled={!isAvailable(size)}
                  >
                    {size.size}
                    {!isAvailable(size) && <span className="block text-red-500 text-xs">Sold Out</span>}
                  </button>
                ))}
              </div>
              
              {/* Edition Information */}
              {selectedSize && (
                <div className="text-sm text-gray-500 mb-4">
                  <p>
                    Edition {selectedSize.editions_sold + 1} of {selectedSize.edition_limit} available
                  </p>
                </div>
              )}
              
              {/* Quantity and Add to Cart */}
              <div className="flex items-center mb-4">
                <div className="flex border border-gray-300 mr-2">
                  <button 
                    className="px-3 py-2 border-r border-gray-300" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button 
                    className="px-3 py-2 border-l border-gray-300" 
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className={`flex-1 py-2 px-4 ${selectedSize && isAvailable(selectedSize) ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  onClick={() => handleAddToCart(quantity)}
                  disabled={!selectedSize || !isAvailable(selectedSize)}
                >
                  ADD TO CART - {formatPrice((selectedSize?.price || artwork.sizes[0]?.price) * quantity)}
                </button>
              </div>
              
              {/* PayPal/Venmo Button */}
              <div className="flex space-x-2 mb-6">
                <button className="flex-1 bg-[#0070ba] text-white py-3 flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.028-.024.13a.804.804 0 0 1-.794.68h-2.52a.483.483 0 0 1-.477-.558l.79-5.02h1.518L8.837 23.4h2.52a.805.805 0 0 0 .794-.68l.041-.22.63-4.027a.804.804 0 0 1 .793-.68h.5c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327" />
                    <path d="M18.452 7.532c-.656-.864-1.694-1.229-2.924-1.229H11.85a.483.483 0 0 0-.477.558l1.958 12.474a.804.804 0 0 0 .794.68h2.52a.483.483 0 0 0 .477-.558l-.79-5.02h1.518l.79 5.02a.804.804 0 0 0 .794.68h2.52a.483.483 0 0 0 .477-.558l-1.958-12.474a.805.805 0 0 0-.794-.68h-2.52c-1.23 0-2.268.365-2.924 1.23" />
                    <path d="M8.364 1.143a.483.483 0 0 0-.477.558l1.958 12.474a.804.804 0 0 0 .794.68H13.16a.483.483 0 0 0 .477-.558L11.68 1.822a.805.805 0 0 0-.794-.68H8.364z" />
                  </svg>
                  <span className="font-bold">PayPal</span>
                </button>
                <button className="flex-1 bg-[#008CFF] text-white py-3 flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-2.5 6h-2v2h2v2h-2v2h-2v-2h-2v2h-2v-2h-2v-2h2v-2h-2V7h2v2h2V7h2v2h2V7h2v2z" />
                  </svg>
                  <span className="font-bold">Venmo</span>
                </button>
              </div>
            </div>
            
            {/* Shipping Information Icons */}
            <div className="grid grid-cols-4 gap-2 text-center py-4 border-t border-gray-200 mb-6">
              <div className="flex flex-col items-center">
                <div className="bg-[#0070ba]/10 p-2 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0070ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-xs">Museum quality print.</p>
                <p className="text-xs">100 year guarantee.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-[#0070ba]/10 p-2 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0070ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <p className="text-xs">Every print is</p>
                <p className="text-xs">made-to-order.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-[#0070ba]/10 p-2 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0070ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs">No import</p>
                <p className="text-xs">fees for USA, UK, and EU.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-[#0070ba]/10 p-2 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0070ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs">Shipped in 5-7</p>
                <p className="text-xs">business days.</p>
              </div>
            </div>
            
            {/* Expandable Sections */}
            <div className="space-y-4 mt-8">
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
                  <div className="pt-4 prose prose-sm max-w-none space-y-2">
                    <p><span className="font-medium">Year:</span> {artwork.year}</p>
                    <p><span className="font-medium">Medium:</span> {artwork.medium}</p>
                    <p><span className="font-medium">Collection:</span> {artwork.collection_name || 'Uncategorized'}</p>
                    <p>{artwork.description}</p>
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
                    <p><span className="font-medium">Print quality:</span> Museum-quality giclée print on 100% cotton rag archival paper.</p>
                    <p><span className="font-medium">Finish:</span> Matte finish with a slightly textured surface.</p>
                    <p>Spencer Grey&apos;s work is known for its unique blend of abstract and figurative elements. Each limited edition print is carefully produced to capture the essence of the original artwork.</p>
                    <p><span className="font-medium">Framing:</span> Ships unframed, ready to be framed to your preference.</p>
                    <p><span className="font-medium">Certificate:</span> Includes a certificate of authenticity.</p>
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
              <SocialShare 
                url={window.location.href}
                title={artwork.title}
                description={`Check out ${artwork.title} by Spencer Grey - Limited edition fine art print.`}
              />
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