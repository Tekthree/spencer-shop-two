/**
 * Footer component for Spencer Grey Artist Website
 * Provides site-wide footer with links and sustainability messaging
 */
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 md:py-24 px-6 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand & Sustainability Message */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="font-serif text-xl">Spencer Grey</h3>
          <p className="text-sm text-gray-600 max-w-md leading-relaxed">
            Limited edition fine art prints, produced with sustainable materials
            and a commitment to environmental responsibility. Each piece is crafted
            to museum-quality standards and made to order.
          </p>
          <div className="flex space-x-6 pt-2">
            <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Twitter">
              Twitter
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg">Shop</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shop" className="text-gray-400 hover:text-black transition-colors">
                All Artworks
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-gray-400 hover:text-black transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-400 hover:text-black transition-colors">
                About the Artist
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-black transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Info Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg">Information</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shipping" className="text-gray-400 hover:text-black transition-colors">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-black transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-black transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-black transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 text-sm text-gray-400">
        <p>© {currentYear} Spencer Grey. All rights reserved.</p>
      </div>
    </footer>
  );
}
