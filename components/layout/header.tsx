"use client";

/**
 * Header component for Spencer Grey Artist Website
 * Provides main navigation and branding
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Determine if a nav link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="py-8 px-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo/Brand */}
        <div className="mb-8 md:mb-0">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Spencer Grey
          </Link>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex space-x-12 text-sm">
          <Link 
            href="/shop" 
            className={`${isActive('/shop') ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Shop All
          </Link>
          <Link 
            href="/about" 
            className={`${isActive('/about') ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`${isActive('/contact') ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Contact
          </Link>
          <Link 
            href="/cart" 
            className={`${isActive('/cart') ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
