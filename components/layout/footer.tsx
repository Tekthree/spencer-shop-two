/**
 * Footer component for Spencer Grey Artist Website
 * Provides site-wide footer with links, benefits bar, and sustainability messaging
 */
import Link from 'next/link';
import SpencerLogo from '@/components/shared/spencer-logo';
import { Award, Leaf, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-black text-white">
      {/* Benefits Bar */}
      <div className="border-t border-white/10 py-8 px-6">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center">
          <div className="py-4 md:py-6 border-r border-b md:border-b-0 border-white/10 px-4">
            <div className="flex justify-center mb-3">
              <Award className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-sm md:text-base text-white/80 font-serif">Certificate of Authenticity with every print</p>
          </div>
          <div className="py-4 md:py-6 border-b md:border-b-0 md:border-r border-white/10 px-4">
            <div className="flex justify-center mb-3">
              <Leaf className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-sm md:text-base text-white/80 font-serif">Carbon neutral worldwide shipping</p>
          </div>
          <div className="py-4 md:py-6 border-r border-white/10 px-4">
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-sm md:text-base text-white/80 font-serif">All payments are securely processed</p>
          </div>
          <div className="py-4 md:py-6 px-4">
            <div className="flex justify-center mb-3">
              <Clock className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-sm md:text-base text-white/80 font-serif">Limited edition prints. No restocks ever.</p>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="py-16 md:py-24 px-6 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
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

      {/* Copyright and Payment Methods */}
      <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-white/10 text-sm text-white/60">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© {currentYear} Spencer Grey. All rights reserved.</p>
          
          {/* Payment Trust Badges */}
          <div className="flex items-center">
            <div className="flex items-center">
              
              
              {/* Credit Card Icons */}
              <div className="flex">
                <div className="rounded-md p-1 h-8 w-12 flex items-center justify-center">
                  <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa">
                    <title id="pi-visa">Visa</title>
                    <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path>
                    <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path>
                    <path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path>
                  </svg>
                </div>
                <div className="rounded-md p-1 h-8 w-12 flex items-center justify-center">
                  <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-master">
                    <title id="pi-master">Mastercard</title>
                    <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path>
                    <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path>
                    <circle fill="#EB001B" cx="15" cy="12" r="7"></circle>
                    <circle fill="#F79E1B" cx="23" cy="12" r="7"></circle>
                    <path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path>
                  </svg>
                </div>
                <div className="rounded-md p-1 h-8 w-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 38 24" width="38" height="24" aria-labelledby="pi-american_express">
                    <title id="pi-american_express">American Express</title>
                    <g fill="none">
                      <path fill="#000" d="M35,0 L3,0 C1.3,0 0,1.3 0,3 L0,21 C0,22.7 1.4,24 3,24 L35,24 C36.7,24 38,22.7 38,21 L38,3 C38,1.3 36.6,0 35,0 Z" opacity=".07"/>
                      <path fill="#006FCF" d="M35,1 C36.1,1 37,1.9 37,3 L37,21 C37,22.1 36.1,23 35,23 L3,23 C1.9,23 1,22.1 1,21 L1,3 C1,1.9 1.9,1 3,1 L35,1"/>
                      <path fill="#FFF" d="M8.971,10.268 L9.745,12.144 L8.203,12.144 L8.971,10.268 Z M25.046,10.346 L22.069,10.346 L22.069,11.173 L24.998,11.173 L24.998,12.412 L22.075,12.412 L22.075,13.334 L25.052,13.334 L25.052,14.073 L27.129,11.828 L25.052,9.488 L25.046,10.346 L25.046,10.346 Z M10.983,8.006 L14.978,8.006 L15.865,9.941 L16.687,8 L27.057,8 L28.135,9.19 L29.25,8 L34.013,8 L30.494,11.852 L33.977,15.68 L29.143,15.68 L28.065,14.49 L26.94,15.68 L10.03,15.68 L9.536,14.49 L8.406,14.49 L7.911,15.68 L4,15.68 L7.286,8 L10.716,8 L10.983,8.006 Z M19.646,9.084 L17.407,9.084 L15.907,12.62 L14.282,9.084 L12.06,9.084 L12.06,13.894 L10,9.084 L8.007,9.084 L5.625,14.596 L7.18,14.596 L7.674,13.406 L10.27,13.406 L10.764,14.596 L13.484,14.596 L13.484,10.661 L15.235,14.602 L16.425,14.602 L18.165,10.673 L18.165,14.603 L19.623,14.603 L19.647,9.083 L19.646,9.084 Z M28.986,11.852 L31.517,9.084 L29.695,9.084 L28.094,10.81 L26.546,9.084 L20.652,9.084 L20.652,14.602 L26.462,14.602 L28.076,12.864 L29.624,14.602 L31.499,14.602 L28.987,11.852 L28.986,11.852 Z"/>
                    </g>
                  </svg>
                </div>
                <div className="rounded-md p-1 h-8 w-12 flex items-center justify-center">
                  <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" width="38" height="24" role="img" aria-labelledby="pi-discover">
                    <title id="pi-discover">Discover</title>
                    <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"/>
                    <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"/>
                    <path d="M37 16.95V21c0 1.1-.9 2-2 2H23.228c7.896-1.815 12.043-4.601 13.772-6.05z" fill="#EDA024"/>
                    <path fill="#494949" d="M9 11h20v2H9z"/>
                    <path d="M22 12c0 1.7-1.3 3-3 3s-3-1.4-3-3 1.4-3 3-3c1.7 0 3 1.3 3 3z" fill="#EDA024"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* PayPal and Venmo */}
            <div className="flex">
              <div className="rounded-md p-1 h-8 flex items-center justify-center">
                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" width="38" height="24" role="img" aria-labelledby="pi-paypal">
                  <title id="pi-paypal">PayPal</title>
                  <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
                  <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
                  <path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"/>
                  <path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"/>
                  <path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"/>
                </svg>
              </div>
              <div className="rounded-md p-1 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="3" fill="white"/>
                  <path d="M25.8468 6.67188H12.1532C9.31173 6.67188 7 8.98361 7 11.825V18.3281H12.1532V11.825C12.1532 11.0766 12.7548 10.475 13.5032 10.475H24.4968C25.2452 10.475 25.8468 11.0766 25.8468 11.825V18.3281H31V11.825C31 8.98361 28.6883 6.67188 25.8468 6.67188Z" fill="#008CFF"/>
                  <path d="M19 14.2781C17.5033 14.2781 16.2875 15.4939 16.2875 16.9906C16.2875 18.4873 17.5033 19.7031 19 19.7031C20.4967 19.7031 21.7125 18.4873 21.7125 16.9906C21.7125 15.4939 20.4967 14.2781 19 14.2781Z" fill="#008CFF"/>
                </svg>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
