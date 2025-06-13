/**
 * Footer component for Spencer Grey Artist Website
 * Provides site-wide footer with links, benefits bar, and sustainability messaging
 */
import Link from 'next/link';
import SpencerLogo from '@/components/shared/spencer-logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-black text-white">
      {/* Benefits Bar */}
      <div className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center">
          <div className="py-4 md:py-6 border-r border-b md:border-b-0 border-white/10 px-4">
            <p className="text-sm md:text-base text-white/80 font-serif">Certificate of Authenticity with every print</p>
          </div>
          <div className="py-4 md:py-6 border-b md:border-b-0 md:border-r border-white/10 px-4">
            <p className="text-sm md:text-base text-white/80 font-serif">Carbon neutral worldwide shipping</p>
          </div>
          <div className="py-4 md:py-6 border-r border-white/10 px-4">
            <p className="text-sm md:text-base text-white/80 font-serif">All payments are securely processed</p>
          </div>
          <div className="py-4 md:py-6 px-4">
            <p className="text-sm md:text-base text-white/80 font-serif">Limited edition prints. No restocks ever.</p>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="py-16 md:py-24 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand & Sustainability Message */}
        <div className="space-y-6 md:col-span-2">
          <SpencerLogo size="extra-large" textColor="white" />
          {/* Minimal spacer */}
          <div className="h-1"></div>
          <p className="text-sm text-white/80 max-w-md leading-relaxed">
            Limited edition fine art prints, produced with sustainable materials
            and a commitment to environmental responsibility. Each piece is crafted
            to museum-quality standards and made to order.
          </p>
          <div className="flex space-x-6 pt-2">
            <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Twitter">
              Twitter
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-white">Shop</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shop" className="text-white/60 hover:text-white transition-colors">
                All Artworks
              </Link>
            </li>

            <li>
              <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                About the Artist
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Info Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-white">Information</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shipping" className="text-white/60 hover:text-white transition-colors">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-white/60 hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-sm text-white/60">
        <p>© {currentYear} Spencer Grey. All rights reserved.</p>
      </div>
      </div>
    </footer>
  );
}
