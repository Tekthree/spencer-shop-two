"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/artwork/product-card';

// Define types for the content sections
interface ContentSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

interface AboutPageArtwork {
  id: string;
  title: string;
  images: {
    url: string;
    alt: string;
    type: string;
  }[];
  price?: number;
  featured?: boolean;
  tag?: string;
}

interface AboutPageClientProps {
  contentSections: ContentSection[] | null;
  featuredArtworks: AboutPageArtwork[] | null;
}

/**
 * About Page Client Component
 * Handles animations and rendering of the about page
 */
export default function AboutPageClient({ 
  contentSections, 
  featuredArtworks 
}: AboutPageClientProps) {
  // Content sections are now properly mapped to their respective display areas
  
  // Create fallback content sections in case they're missing from the server
  const fallbackArtistStatement = {
    id: 'statement-fallback',
    title: 'About Spencer Grey',
    content: "MY STORY: DRAWING IS MY BRAIN'S INSTANT TRANSLATOR, TURNING BUZZING THOUGHTS INTO VIVID VISUALS. IT'S NOT ART—IT'S JUST MY VISUAL VOICE.",
    order: 0
  };

  const fallbackMainArtistImage = {
    id: 'main_image-fallback',
    title: 'Main Artist Image',
    content: "",
    image_url: '/images/about/artist-portrait.jpg',
    order: 1
  };

  const fallbackMainDescription = {
    id: 'main_description-fallback',
    title: 'Main Description',
    content: "From Miami to New York, my artwork has been exhibited around the world. Each piece is meticulously printed on archival paper, ensuring rich, vibrant colors that will last for generations. My work explores the intersection of emotion and abstraction, inviting viewers to find their own meaning within each piece.",
    order: 2
  };

  const fallbackGalleryImage1 = {
    id: 'gallery-image-1-fallback',
    title: 'Gallery Image 1',
    content: "",
    image_url: '/images/about/gallery-1.jpg',
    order: 3
  };

  const fallbackGalleryImage2 = {
    id: 'gallery-image-2-fallback',
    title: 'Gallery Image 2',
    content: "",
    image_url: '/images/about/gallery-2.jpg',
    order: 4
  };

  const fallbackGalleryImage3 = {
    id: 'gallery-image-3-fallback',
    title: 'Gallery Image 3',
    content: "",
    image_url: '/images/about/gallery-3.jpg',
    order: 5
  };

  const fallbackSecondaryDescription = {
    id: 'secondary-desc-fallback',
    title: 'Secondary Description',
    content: "All of my prints are produced using archival-quality materials, ensuring that each piece will maintain its vibrancy and integrity for generations. I believe in sustainable art practices and work with eco-conscious print partners who share my commitment to environmental responsibility.",
    order: 6
  };

  const fallbackSignature = {
    id: 'signature-fallback',
    title: 'Signature',
    content: "Spencer Grey",
    image_url: '/images/about/signature.png',
    order: 7
  };

  // Find specific content sections by their IDs or use fallbacks
  // First try to find by ID (from CMS), then by title (for backward compatibility)
  const artistStatement = contentSections?.find(section => section.id === 'statement') || 
                         contentSections?.find(section => section.title === 'Artist Statement') || 
                         fallbackArtistStatement;
                     
  const mainArtistImage = contentSections?.find(section => section.id === 'main_image') || 
                         contentSections?.find(section => section.title === 'Main Artist Image') || 
                         fallbackMainArtistImage;
                   
  const mainDescription = contentSections?.find(section => section.id === 'main_description') || 
                         contentSections?.find(section => section.title === 'Main Description') || 
                         fallbackMainDescription;
                              
  const galleryImage1 = contentSections?.find(section => section.title === 'Gallery Image 1') || fallbackGalleryImage1;
  const galleryImage2 = contentSections?.find(section => section.title === 'Gallery Image 2') || fallbackGalleryImage2;
  const galleryImage3 = contentSections?.find(section => section.title === 'Gallery Image 3') || fallbackGalleryImage3;
  const secondaryDescription = contentSections?.find(section => section.title === 'Secondary Description') || fallbackSecondaryDescription;
  const signature = contentSections?.find(section => section.title === 'Signature') || fallbackSignature;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.main 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Artist Statement Section */}
      <motion.div 
        className="mb-16 text-center"
        variants={itemVariants}
      >
        <motion.p 
          className="text-lg md:text-xl max-w-3xl mx-auto font-serif"
          variants={itemVariants}
        >
          {artistStatement.content}
        </motion.p>
      </motion.div>

      {/* Main Artist Image - Full Width Hero Banner */}
      <motion.div 
        className="mb-12 w-full"
        variants={itemVariants}
      >
        {mainArtistImage.image_url && (
          <motion.div 
            className="relative w-full h-[500px] md:h-[600px] overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src={mainArtistImage.image_url}
              alt={mainArtistImage.title || "Spencer Grey"}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </motion.div>
        )}
      </motion.div>
      
      {/* Main Description - Centered Below Image */}
      <motion.div 
        className="mb-16 max-w-3xl mx-auto text-center"
        variants={itemVariants}
      >
        <motion.p 
          className="text-base md:text-lg leading-relaxed"
          variants={itemVariants}
        >
          {mainDescription.content}
        </motion.p>
      </motion.div>

      {/* Gallery Images Section */}
      <motion.div 
        className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        {galleryImage1 && galleryImage1.image_url && (
          <motion.div 
            className="relative h-[300px] w-full overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src={galleryImage1.image_url}
              alt={galleryImage1.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
        )}
        {galleryImage2 && galleryImage2.image_url && (
          <motion.div 
            className="relative h-[300px] w-full overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src={galleryImage2.image_url}
              alt={galleryImage2.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
        )}
        {galleryImage3 && galleryImage3.image_url && (
          <motion.div 
            className="relative h-[300px] w-full overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src={galleryImage3.image_url}
              alt={galleryImage3.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Secondary Description */}
      <motion.div 
        className="mb-16 max-w-3xl mx-auto text-center"
        variants={itemVariants}
      >
        <motion.p 
          className="text-lg leading-relaxed"
          variants={itemVariants}
        >
          {secondaryDescription.content}
        </motion.p>
        {signature && signature.image_url && (
          <motion.div 
            className="mt-8 flex justify-center"
            variants={itemVariants}
          >
            <Image
              src={signature.image_url}
              alt="Spencer Grey Signature"
              width={200}
              height={80}
              className="object-contain"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Featured Artworks Section */}
      <motion.div 
        className="mb-16"
        variants={itemVariants}
      >
        <motion.h2 
          className="text-2xl font-serif mb-8 text-center"
          variants={itemVariants}
        >
          Shop the Art Prints
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {featuredArtworks?.map((artwork) => {
            return (
              <motion.div 
                key={artwork.id} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard 
                  id={artwork.id} 
                  title={artwork.title} 
                  images={artwork.images}
                  price={artwork.price}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.p 
          className="text-sm mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          If you have any questions or comments, please don&apos;t hesitate to get in touch with me. I look forward to hearing from you!
        </motion.p>
        <motion.div 
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              href="/faq" 
              className="inline-block px-6 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors duration-300"
            >
              JUMP TO FAQ
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              href="/contact" 
              className="inline-block px-6 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors duration-300"
            >
              CONTACT ME
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
