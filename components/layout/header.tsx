"use client";

/**
 * Header component for Spencer Grey Artist Website
 * Provides main navigation and branding
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import SpencerLogo from '@/components/shared/spencer-logo';

export default function Header() {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();
  
  // Determine if a nav link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="py-8 px-6 border-b border-[#020312]/10 bg-[#F6F4F0]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo/Brand */}
        <div className="mb-8 md:mb-0">
          <SpencerLogo size="extra-large" />
        </div>
        
        {/* Main Navigation */}
        <nav className="flex items-center space-x-12 text-sm font-medium">
          <Link 
            href="/shop" 
            className={`${isActive('/shop') ? 'text-[#020312]' : 'text-[#020312]/60'} hover:text-[#020312] transition-colors`}
          >
            Shop All
          </Link>
          <Link 
            href="/about" 
            className={`${isActive('/about') ? 'text-[#020312]' : 'text-[#020312]/60'} hover:text-[#020312] transition-colors`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`${isActive('/contact') ? 'text-[#020312]' : 'text-[#020312]/60'} hover:text-[#020312] transition-colors`}
          >
            Contact
          </Link>
          
          {/* Cart Button */}
          <button 
            onClick={openCart}
            className="relative flex items-center text-[#020312]/60 hover:text-[#020312] transition-colors"
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
