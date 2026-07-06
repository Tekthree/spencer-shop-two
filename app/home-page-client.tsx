"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/artwork/product-card";
import { ensureNumericPrice } from "@/components/artwork/price-helper";
import { useState } from "react";
import ArtworkGrid from "@/components/home/artwork-grid";
import { MarqueeHeading } from "@/components/ui/marquee-heading";
import useEmblaCarousel from 'embla-carousel-react';

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
  slug: string;
  title: string;
  price: string | number;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  tag?: string;
  hidePrice?: boolean;
};

interface HomePageClientProps {
  featuredArtworks: Artwork[];
  recentArtworks: Artwork[];
}

const TAB_DATA = [
  {
    id: 'limited' as const,
    label: 'Limited Prints',
    heading: 'Limited Edition Prints',
    media: (
      <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
        <source src="/snapsave.mp4" type="video/mp4" />
      </video>
    ),
    body: [
      'Each piece is part of an exclusive, limited edition collection. Once 150 prints of each artwork are sold, they will never be printed again — making every print a rare addition to your collection.',
      'Every print is numbered by hand and accompanied by a signed certificate of authenticity.',
    ],
  },
  {
    id: 'museum' as const,
    label: 'Museum Quality',
    heading: 'Museum Quality Materials',
    media: (
      <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
        <source src="/bright_love.mp4" type="video/mp4" />
      </video>
    ),
    body: [
      'All prints are crafted using museum-quality giclée techniques on premium archival cotton rag. Pigment-based inks resist fading for over 100 years when properly displayed.',
      'Every print is individually quality-checked before shipping to ensure perfect color and presentation.',
    ],
  },
  {
    id: 'order' as const,
    label: 'Print to Order',
    heading: 'Print to Order Process',
    media: (
      <Image src="/hero-spencer.jpg" alt="Print to order" fill className="object-cover" priority />
    ),
    body: [
      'Every print is made fresh once you order — no inventory, no waste. Each piece gets individual attention during production.',
      'Your print ships directly to your door, typically within 5–7 business days.',
    ],
  },
];

function TabInterface() {
  const [activeTab, setActiveTab] = useState<'limited' | 'museum' | 'order'>('limited');
  const activeData = TAB_DATA.find(t => t.id === activeTab)!;

  const [tabEmblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const contentVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  return (
    <div>
      {/* Mobile: horizontal drag slider */}
      <div className="lg:hidden">
        <div style={{ position: 'relative' }}>
          <div ref={tabEmblaRef} className="ti-vp">
            <div className="ti-ct">
              {TAB_DATA.map((tab) => (
                <div key={tab.id} className="ti-sl">
                  <div className="ti-media">
                    {tab.media}
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#020312]/40">{tab.label}</p>
                    <h3 className="font-serif text-2xl text-[#020312] leading-tight">{tab.heading}</h3>
                    {tab.body.map((para, i) => (
                      <p key={i} className="text-sm text-[#020312]/75 leading-relaxed">{para}</p>
                    ))}
                    <Link
                      href="/shop"
                      className="inline-block border border-[#020312]/20 px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#020312] hover:text-white transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 60,
              background: 'linear-gradient(to right, transparent, #e8e8f6)',
              pointerEvents: 'none', zIndex: 2,
            }}
          />
        </div>
        <style>{`
          .ti-vp { overflow: hidden; cursor: grab; }
          .ti-vp:active { cursor: grabbing; }
          .ti-ct { display: flex; gap: 24px; }
          .ti-sl { flex-shrink: 0; width: 80vw; max-width: 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px; }
          .ti-media { position: relative; aspect-ratio: 9/14; overflow: hidden; background: #EDEAE4; }
        `}</style>
      </div>

      {/* Desktop: click tabs */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-12 items-center min-h-[500px]">
        {/* Col 1: tab nav */}
        <div className="flex flex-col gap-10 justify-center">
          {TAB_DATA.map((tab) => (
            <button
              key={tab.id}
              className={`text-left transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <h3 className={`font-serif text-4xl tracking-tight ${activeTab === tab.id ? 'border-b border-[#020312]' : ''}`}>
                {tab.label}
              </h3>
            </button>
          ))}
        </div>

        {/* Col 2: media */}
        <motion.div
          key={`media-${activeTab}`}
          className="relative aspect-[9/16] w-full max-w-[320px] mx-auto overflow-hidden bg-[#EDEAE4]"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeData.media}
        </motion.div>

        {/* Col 3: text */}
        <motion.div
          key={`text-${activeTab}`}
          className="space-y-5 flex flex-col justify-center"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <h3 className="font-serif text-3xl text-[#020312]">{activeData.heading}</h3>
          {activeData.body.map((para, i) => (
            <p key={i} className="text-[#020312]/80 leading-relaxed">{para}</p>
          ))}
          <Link
            href="/shop"
            className="inline-block border border-[#020312]/10 px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors mt-4"
          >
            SHOP NOW
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function HomePageClient({ featuredArtworks, recentArtworks }: HomePageClientProps) {
  const [newWorkEmblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
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
      {/* Hero Section */}
      <section className="pt-6 md:pt-10 lg:pt-12 pb-0">
        <MarqueeHeading speed="slow" className="" data-component-name="HomePageClient">
          <span className="clandyFontOverride">Electric</span> Magnetic Cosmic Dragon Spencer Presence
        </MarqueeHeading>

        <div className="max-w-[1440px] mx-auto px-6 pb-16 md:pb-24">
          <motion.div
            className="relative w-full aspect-[16/9] overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Image
              src="/hero-spencer.jpg"
              alt="Spencer Grey artwork installed in a home"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-white bg-black/60 backdrop-blur-sm px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-black transition-colors"
              >
                Shop the Art Prints
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
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
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-8 text-[#020312]">
            &ldquo;My creative process involves layers of intuition, technique, and emotional resonance. The work connects us to something deeper than what we can name.&rdquo;
          </blockquote>
          <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#020312]/10">
              <Image
                src="https://pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev/artworks/headshot.jpg"
                alt="Spencer Grey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
                priority
              />
            </div>
            <cite className="text-sm font-medium not-italic text-[#020312]/70">
              Spencer Grey
            </cite>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Artworks Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.p
            className="text-xs uppercase tracking-[0.2em] text-[#020312]/50 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            The Collection
          </motion.p>
          <ArtworkGrid artworks={featuredArtworks} />
        </div>
      </section>

      {/* New Work Section */}
      <section className="py-16 md:py-24 px-6 bg-[#F6F4F0]">
        <div className="max-w-[1440px] mx-auto">
          <motion.h2
            className="font-serif text-3xl md:text-4xl mb-12 text-[#020312]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            New Work
          </motion.h2>
          <div style={{ position: 'relative' }}>
            <div ref={newWorkEmblaRef} className="nw-vp">
              <div className="nw-ct">
                {recentArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.slug}
                    className="nw-sl"
                    variants={itemVariants}
                    custom={index as number}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard
                      slug={artwork.slug}
                      title={artwork.title}
                      images={artwork.images}
                      price={ensureNumericPrice(artwork.price)}
                      className="h-full"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            <div
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
                background: 'linear-gradient(to right, transparent, #F6F4F0)',
                pointerEvents: 'none', zIndex: 2,
              }}
            />
          </div>
          <style>{`
            .nw-vp { overflow: hidden; cursor: grab; }
            .nw-vp:active { cursor: grabbing; }
            .nw-ct { display: flex; gap: 32px; }
            .nw-sl { flex-shrink: 0; width: 300px; min-width: 0; display: flex; flex-direction: column; }
            @media (min-width: 640px) { .nw-sl { width: 320px; } }
          `}</style>
        </div>
      </section>

      {/* Art Collection Features Section */}
      <section className="py-16 md:py-24 px-6 bg-[#e8e8f6]" data-component-name="HomePageClient">
        <div className="max-w-[1440px] mx-auto">
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
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-8 text-[#020312]">
            &ldquo;Each piece is born from the balance between chaos and order. A meditation on form, color, and texture. An invitation to stop and feel something.&rdquo;
          </blockquote>
          <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#020312]/10">
              <Image
                src="https://pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev/artworks/headshot-three.jpg"
                alt="Spencer Grey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
                priority
              />
            </div>
            <cite className="text-sm font-medium not-italic text-[#020312]/70">
              Spencer Grey
            </cite>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
