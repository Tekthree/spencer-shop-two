/**
 * Footer component for Spencer Grey Artist Website
 * Provides site-wide footer with links and sustainability messaging
 */
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 md:py-24 px-6 border-t border-[#020312]/10 mt-auto bg-[#F6F4F0]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand & Sustainability Message */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="font-serif text-xl text-[#020312]">Spencer Grey</h3>
          <p className="text-sm text-[#020312]/80 max-w-md leading-relaxed">
            Limited edition fine art prints, produced with sustainable materials
            and a commitment to environmental responsibility. Each piece is crafted
            to museum-quality standards and made to order.
          </p>
          <div className="flex space-x-6 pt-2">
            <a href="#" className="text-[#020312]/60 hover:text-[#020312] transition-colors" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="text-[#020312]/60 hover:text-[#020312] transition-colors" aria-label="Twitter">
              Twitter
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-[#020312]">Shop</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shop" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                All Artworks
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                About the Artist
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Info Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-[#020312]">Information</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <Link href="/shipping" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[#020312]/60 hover:text-[#020312] transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#020312]/10 text-sm text-[#020312]/60">
        <p>© {currentYear} Spencer Grey. All rights reserved.</p>
      </div>
    </footer>
  );
}
