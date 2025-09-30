"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import ArtworkHeroBanner from "@/components/artwork/artwork-hero-banner";
import ArtworkStoryTabs from "@/components/artwork/artwork-story-tabs";
import RelatedArtworks from "@/components/artwork/related-artworks";
import SocialShare from "@/components/shared/social-share";
import { useCart } from "@/context/cart-context";

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
  slug: string;
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
}

export default function ArtworkDetailClient({ artwork, error }: ArtworkDetailClientProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(
    artwork?.sizes?.length ? artwork.sizes[0] : null
  );
  const [shareUrl, setShareUrl] = useState("");
  const [expandedSection, setExpandedSection] = useState<"about" | "specs" | "shipping" | "care" | null>("about");

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const isAvailable = (size: SizeOption) => size.editions_sold < size.edition_limit;

  const handleSizeSelect = (size: SizeOption) => {
    setSelectedSize(size);
  };

  const handleAddToCart = (requestedQty: number = 1) => {
    if (!artwork || !selectedSize) return;

    const imageUrl =
      artwork.images && artwork.images.length > 0 ? artwork.images[0].url : "/placeholder.jpg";

    addToCart({
      id: artwork.id,
      title: artwork.title,
      size: selectedSize.size,
      sizeDisplay: selectedSize.size,
      price: selectedSize.price,
      quantity: requestedQty,
      imageUrl,
    });
  };

  const handleBuyNow = () => {
    if (!artwork || !selectedSize || !isAvailable(selectedSize)) return;
    handleAddToCart(quantity);
    router.push("/checkout");
  };

  const nextImage = () => {
    if (!artwork) return;
    setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length);
  };

  const prevImage = () => {
    if (!artwork) return;
    setCurrentImageIndex((prev) => (prev - 1 + artwork.images.length) % artwork.images.length);
  };

  useEffect(() => {
    if (artwork?.sizes?.length) {
      setSelectedSize(artwork.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
    setCurrentImageIndex(0);
    setExpandedSection("about");
  }, [artwork?.id, artwork?.sizes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(window.location.href);
  }, []);

  const shareDescription = useMemo(() => {
    if (!artwork) return "";

    const summaryParts = [
      artwork.medium ? `${artwork.medium}` : null,
      artwork.year ? `Created in ${artwork.year}` : null,
    ].filter(Boolean);

    const textFragments = [summaryParts.join(", "), artwork.description?.trim()].filter(
      (fragment): fragment is string => Boolean(fragment && fragment.length)
    );

    if (!textFragments.length) {
      return "Discover this limited edition artwork by Spencer Grey.";
    }

    const combined = textFragments.join(" – ");
    const MAX_LENGTH = 240;

    if (combined.length <= MAX_LENGTH) {
      return combined;
    }

    return `${combined.slice(0, MAX_LENGTH - 1).trimEnd()}…`;
  }, [artwork]);

  if (error) {
    return (
      <div className="px-[5%] py-12">
        <div className="mx-auto max-w-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Error Loading Artwork</h1>
          <p className="mt-4 text-neutral-600">{error}</p>
          <Link href="/shop" className="mt-6 inline-flex items-center justify-center bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="px-[5%] py-12">
        <div className="mx-auto max-w-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Artwork Not Found</h1>
          <p className="mt-4 text-neutral-600">The artwork you&apos;re looking for could not be found.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center justify-center bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const wasRecentlyAdded = new Date(artwork.created_at) > thirtyDaysAgo;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];
  const breadcrumbTrail = breadcrumbs;

  const editionLimit = selectedSize?.edition_limit || artwork.sizes[0]?.edition_limit || 150;

  const sellingPoints = [
    {
      id: "limited",
      title: "Limited edition",
      description: `Only ${editionLimit} prints available. No restocks, ever.`,
    },
    {
      id: "signed",
      title: "Signed and Numbered",
      description: "Own a truly exclusive piece.",
    },
    {
      id: "certificate",
      title: "Certificate of Authenticity included",
      description: "Proof that your artwork is an original from the artist.",
    },
    {
      id: "handcrafted",
      title: "Handcrafted Art",
      description: "No AI, just 40+ hours of passion in every detail.",
    },
    {
      id: "museum",
      title: "Museum-Grade Prints",
      description: "Built to last 100+ years. HD Giclée print on 310 g/m2 Hahnemühle German Etching paper.",
    },
    {
      id: "framing",
      title: "Ready to frame, no matting needed",
      description: "Each print includes a white border, perfectly centering the artwork to stand out more prominently.",
    },
  ];
  const shippingHighlights = [
    {
      copy: "Museum quality print. 100 year guarantee.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-[#6c63ff]" fill="currentColor">
          <path d="M12 2L3 7v7c0 5 3.9 9.7 9 10 5.1-.3 9-5 9-10V7l-9-5zm0 2.2l7 3.9v5.9c0 4-3 7.6-7 7.9-4-.3-7-3.9-7-7.9V8.1l7-3.9z" />
          <path d="M11.3 14.7l-2-2a1 1 0 1 1 1.4-1.4l1.3 1.29 3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0z" />
        </svg>
      ),
    },
    {
      copy: "Every print is made-to-order. Hand finished in our studio.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-[#6c63ff]" fill="currentColor">
          <path d="M5 3a2 2 0 0 0-2 2v14l3-3h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm0 2h12v9a1 1 0 0 1-1 1H5.83L5 16.83V5z" />
        </svg>
      ),
    },
    {
      copy: "No import fees for USA, UK, and EU. Shipped locally to you.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-[#6c63ff]" fill="currentColor">
          <path d="M12 2a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm7 9a7 7 0 0 1-3.38 6H13v-3h3v-2h-3v-2h4.44A6.9 6.9 0 0 1 19 11zm-7-7a7 7 0 0 1 2.56.49L11 7.05V5H9v2H7v2h2v2H6.56A7 7 0 0 1 12 4zm-7 7a7 7 0 0 1 .56-2.72H9v3h3v2H8v3h2v2H8.38A7 7 0 0 1 5 11zm7 7a7 7 0 0 1-1-.07V16h2v2.93A7 7 0 0 1 12 18z" />
        </svg>
      ),
    },
    {
      copy: "Shipped in 5-7 business days. Tracked and insured delivery.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-[#6c63ff]" fill="currentColor">
          <path d="M3 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3h1.5a2 2 0 0 1 1.6.8l2.4 3.2a2 2 0 0 1 .4 1.2v3a2 2 0 0 1-2 2h-.18a2.5 2.5 0 0 1-4.64 0H9.42a2.5 2.5 0 0 1-4.64 0H4a2 2 0 0 1-2-2zm2 0h9v3H5zm11 3h1.5l2.4 3.2V14H16zM7.5 17a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 7.5 17zm9 0a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16.5 17z" />
        </svg>
      ),
    },
  ];

  const imageCount = artwork.images.length;
  const splitIndex = imageCount > 2 ? imageCount - 2 : imageCount;
  const primaryImages = artwork.images.slice(0, splitIndex);
  const trailingImages = artwork.images.slice(splitIndex);

  const accordionSections: Array<{
    id: "about" | "specs" | "shipping" | "care";
    title: string;
    content: ReactNode;
  }> = [
    {
      id: "about",
      title: "About the Piece",
      content: (
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-neutral-600">
            <p>
              <span className="font-semibold text-neutral-900">Year:</span> {artwork.year}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">Medium:</span> {artwork.medium}
            </p>
            {artwork.collection_name && (
              <p>
                <span className="font-semibold text-neutral-900">Collection:</span>{" "}
                <Link
                  href={artwork.collection_id ? `/collections/${artwork.collection_id}` : "/shop"}
                  className="underline transition-colors duration-200 hover:text-neutral-900"
                >
                  {artwork.collection_name}
                </Link>
              </p>
            )}
          </div>
          <p>{artwork.description}</p>
        </div>
      ),
    },
    {
      id: "specs",
      title: "Details & Specs",
      content: (
        <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
          <li>
            <span className="font-semibold text-neutral-900">Handcrafted Art:</span> No AI, just 40+ hours of painting in every detail.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Museum-Grade Prints:</span> Built to last 100+ years. HD Giclée print on 310 g/m² Hahnemühle German Etching paper.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Ready to frame:</span> Includes a white border so the artwork immediately stands out.
          </li>
        </ul>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: (
        <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
          <li>
            <span className="font-semibold text-neutral-900">Free shipping:</span> All orders ship free.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Shipping time:</span> Shipped in 5-7 business days.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">No import fees:</span> Dispatched from the USA, UK, and EU.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Returns:</span> We accept returns within 30 days of delivery.
          </li>
        </ul>
      ),
    },
    {
      id: "care",
      title: "Customer Care",
      content: (
        <div className="space-y-2 text-sm leading-relaxed text-neutral-600">
          <p>
            Have questions? Email us at{" "}
            <a href="mailto:support@spencergrey.com" className="underline">
              support@spencergrey.com
            </a>{" "}
            or visit our{" "}
            <Link href="/faq" className="underline">
              FAQ page
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  const displayedPrice = selectedSize
    ? formatPrice(selectedSize.price)
    : artwork.sizes && artwork.sizes.length > 0
      ? formatPrice(artwork.sizes[0].price)
      : "Price unavailable";

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="px-[5%] py-12 md:py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid grid-cols-1 gap-y-12 md:gap-y-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-16">
            <div className="space-y-6">
              <div className="relative flex flex-col gap-6 lg:hidden">
                <div className="relative overflow-hidden bg-neutral-100">
                  <Image
                    src={artwork.images[currentImageIndex].url}
                    alt={artwork.images[currentImageIndex].alt || artwork.title}
                    width={1200}
                    height={1200}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-auto w-full object-contain"
                    priority
                  />
                  {artwork.images.length > 1 && (
                    <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
                      {artwork.images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 transition ${
                            index === currentImageIndex ? "bg-neutral-900" : "bg-neutral-400/50"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  {artwork.images.length > 1 && (
                    <>
                  <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 shadow-md backdrop-blur"
                        aria-label="Previous image"
                      >
                        <span className="sr-only">Previous image</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-neutral-900">
                          <path
                            fill="currentColor"
                            d="M15.53 4.47a.75.75 0 0 1 0 1.06L10.06 11l5.47 5.47a.75.75 0 0 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 shadow-md backdrop-blur"
                        aria-label="Next image"
                      >
                        <span className="sr-only">Next image</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-neutral-900">
                          <path
                            fill="currentColor"
                            d="m8.47 4.47 6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L12.94 11 7.41 5.53a.75.75 0 0 1 1.06-1.06z"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex lg:flex-col">
                {primaryImages.map((image, index) => (
                  <motion.div
                    key={`primary-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="relative overflow-hidden bg-neutral-100"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || artwork.title}
                      width={1400}
                      height={1400}
                      sizes="50vw"
                      className="h-auto w-full object-contain"
                      priority={index === 0}
                    />
                  </motion.div>
                ))}
                {trailingImages.length === 2 ? (
                  <div className="grid grid-cols-2 gap-0">
                    {trailingImages.map((image, index) => (
                      <motion.div
                        key={`pair-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: (primaryImages.length + index) * 0.08,
                        }}
                        viewport={{ once: true, margin: "-80px" }}
                        className="relative overflow-hidden bg-neutral-100"
                      >
                        <div className="relative h-full w-full pb-[160%]">
                          <Image
                            src={image.url}
                            alt={image.alt || artwork.title}
                            fill
                            sizes="25vw"
                            className="object-cover"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  trailingImages.map((image, index) => (
                    <motion.div
                      key={`tail-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: (primaryImages.length + index) * 0.08,
                      }}
                      viewport={{ once: true, margin: "-80px" }}
                      className="relative overflow-hidden bg-neutral-100"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || artwork.title}
                        width={1400}
                        height={1400}
                        sizes="50vw"
                        className="h-auto w-full object-contain"
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="space-y-8 lg:sticky lg:top-24">
                {breadcrumbTrail.length > 0 && (
                  <nav aria-label="Breadcrumb" className="text-[0.5rem] uppercase tracking-[0.18em] text-neutral-500">
                    <ol className="flex flex-wrap items-center gap-2">
                      {breadcrumbTrail.map((crumb, index) => (
                        <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                          {index > 0 && <span className="text-neutral-300">/</span>}
                          <Link
                            href={crumb.href}
                            className="transition-colors duration-200 hover:text-neutral-900"
                          >
                            {crumb.label}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                <div className="space-y-6">
                  <div className="space-y-3">
                    {wasRecentlyAdded && (
                      <span className="inline-flex items-center bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                        New artwork
                      </span>
                    )}
                    <div className="space-y-2 border-b border-neutral-200 pb-5">
                      <h1 className="text-4xl font-semibold leading-tight text-neutral-900 md:text-5xl">
                        {artwork.title}
                      </h1>
                      <p className="text-2xl font-medium text-neutral-900">{displayedPrice}</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 border-b border-neutral-200 pb-5">
                    {sellingPoints.map((point) => (
                      <li key={point.id} className="flex items-start gap-2.5 text-sm leading-snug text-neutral-700">
                        <span className="mt-0.5">
                          <SellingPointIcon />
                        </span>
                        <span>
                          <span className="font-semibold text-neutral-900">{point.title}</span>
                          {` — ${point.description}`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-4 border-b border-neutral-200 pb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-600">
                        Size
                      </h2>
                      <Link
                        href="/faq"
                        className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 hover:text-neutral-900"
                      >
                        Size guide
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {artwork.sizes.map((size) => {
                        const isSelected = selectedSize?.size === size.size;
                        const soldOut = !isAvailable(size);
                        return (
                          <button
                            key={size.size}
                            type="button"
                            onClick={() => !soldOut && handleSizeSelect(size)}
                            disabled={soldOut}
                            className={`relative flex h-12 items-center justify-center border text-sm font-semibold uppercase tracking-[0.18em] transition ${
                              isSelected
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : soldOut
                                  ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900"
                            }`}
                            aria-label={`Size ${size.size}${soldOut ? " (Sold Out)" : ""}`}
                          >
                            {size.size}
                            {soldOut && (
                              <span className="pointer-events-none absolute inset-px border border-neutral-200">
                                <svg
                                  viewBox="0 0 100 100"
                                  stroke="currentColor"
                                  className="absolute inset-0 h-full w-full text-neutral-300"
                                >
                                  <line x1="0" y1="100" x2="100" y2="0" strokeWidth="6" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize && (
                      <p className="text-xs text-neutral-500">
                        Edition {selectedSize.editions_sold + 1} of {selectedSize.edition_limit} available
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 border-b border-neutral-200 pb-6">
                    <div className="flex w-full items-center gap-3">
                      <div className="flex h-12 flex-shrink-0 items-center border border-neutral-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-lg text-neutral-600 transition hover:text-neutral-900"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[3rem] text-center text-base font-semibold text-neutral-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 text-lg text-neutral-600 transition hover:text-neutral-900"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          selectedSize && isAvailable(selectedSize) && handleAddToCart(quantity)
                        }
                        disabled={!selectedSize || !isAvailable(selectedSize)}
                        className="flex h-12 flex-1 items-center justify-center bg-neutral-900 px-6 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                      >
                        Add to cart —
                        {" "}
                        {formatPrice(
                          (selectedSize?.price || artwork.sizes[0]?.price || 0) * quantity
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedSize && isAvailable(selectedSize) && handleBuyNow()}
                      disabled={!selectedSize || !isAvailable(selectedSize)}
                      className="w-full border border-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
                    >
                      Buy now
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-6 text-center sm:grid-cols-4">
                    {shippingHighlights.map((item, index) => (
                      <div key={index} className="flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ecebff] text-[#6c63ff]">
                          {item.icon}
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">{item.copy}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-b border-neutral-200 pb-6">
                    {accordionSections.map((section) => {
                      const isOpen = expandedSection === section.id;
                      return (
                        <div key={section.id} className="border-b border-neutral-200 last:border-b-0">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSection((prev) => (prev === section.id ? null : section.id))
                            }
                            className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900"
                          >
                            <span>{section.title}</span>
                            <span>{isOpen ? "−" : "+"}</span>
                          </button>
                          {isOpen && <div className="pb-4 text-sm leading-relaxed text-neutral-600">{section.content}</div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4">
                    <SocialShare
                      url={shareUrl || `/artwork/${artwork.slug}`}
                      title={artwork.title}
                      description={shareDescription}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-120px" }}
        className="mt-20 w-full bg-[#ecebff]"
      >
        <div className="mx-auto max-w-[1440px] px-[5%] py-16">
          <ArtworkStoryTabs
            tabs={[
              {
                id: "story",
                title: "MY STORY",
                content:
                  "This artistic journey began long before I understood what it meant to create. From elementary school comic strips to train-hopping rebellion, from punk rock squats to spiritual awakening, each chapter has shaped the visions that flow through these hands. The name Grey found me during a mushroom-guided conversation with dear friends who recognized the frequency I carried. Since adopting this name at nineteen, I've navigated fatherhood, sobriety, heartbreak, romance, and the beautiful tension between what society calls failure and success. Every experience becomes paint. Every moment becomes portal. This work is the physical manifestation of a life lived fully, consciously, gratefully.",
                image: "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/my-story.jpg",
              },
              {
                id: "process",
                title: "MY PROCESS",
                content:
                  "Each piece begins in meditation, allowing cosmic frequencies to reveal themselves before brush touches surface. I work primarily with acrylic ink and acrylic paint, layering intricate details that reward extended viewing. The process demands presence; rushing disrupts the channel. Sometimes a painting manifests in hours during live sessions with music pulsing. Other times, a single piece evolves over months or years as I return to add new dimensions revealed through continued spiritual exploration. My hands serve as conduits. The active imagination that has driven me since childhood combines with decades of technical refinement to translate invisible energies into visible form.",
                image: "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/my-process.jpg",
              },
              {
                id: "inspiration",
                title: "INSPIRATION",
                content:
                  "Music, dance, mythology, theology, the occult, nature's peace, historical architecture, and ancient books all flow through this work. I draw from the mystical experiences that occur when consciousness expands beyond ordinary perception. The intricate patterns in Gothic cathedrals, the symbolism in old occult texts, the raw energy of electronic music gatherings, the quiet wisdom found alone in forests - these all become source material. But the deepest inspiration comes from Love itself and the desire to share that vibration with fellow travelers. Each painting asks: what lies beyond the veil? The answer emerges through color, line, and form.",
                image: "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/inspiration.jpg",
              },
            ]}
          />
        </div>
      </motion.div>

      {artwork.images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-120px" }}
          className="mt-24 w-full"
        >
          <div className="mx-auto max-w-[1440px] px-[5%]">
            <ArtworkHeroBanner images={artwork.images} title="HUNG ON YOUR WALL" />
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-120px" }}
        className="mt-24 w-full"
      >
        <div className="mx-auto max-w-[1440px] px-[5%]">
        <RelatedArtworks
          currentArtworkId={artwork.id}
          collectionId={artwork.collection_id}
          limit={4}
        />
        </div>
      </motion.div>
    </>
  );
}

const SellingPointIcon = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#6c63ff]" fill="currentColor" aria-hidden="true">
    <path d="M8 1.2l2.25 3.97 4.38 1.64-4.38 1.64L8 12.44l-2.25-3.99-4.38-1.64 4.38-1.64z" opacity="0.85" />
    <path d="M8 3.2l1.52 2.68 2.96 1.11-2.96 1.11L8 10.17l-1.52-2.68-2.96-1.11 2.96-1.11z" />
  </svg>
);
