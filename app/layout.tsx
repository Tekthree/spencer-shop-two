import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// Import layout components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Import cart components
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/checkout/cart-drawer";
import CartOverlay from "@/components/checkout/cart-overlay";

// Import SEO components
import DefaultJsonLd from "@/components/shared/default-json-ld";
import SEOHead from "@/components/shared/seo-head";

// Sans-serif font for UI elements
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Serif font for headings and artistic elements
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spencer Grey | Limited Edition Fine Art Prints",
    template: "%s | Spencer Grey Art"
  },
  description: "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
  keywords: ["Spencer Grey", "fine art", "limited edition prints", "art prints", "minimalist art", "contemporary artist", "gallery prints", "art collection"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Spencer Grey Art",
    title: "Spencer Grey | Limited Edition Fine Art Prints",
    description: "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
    images: [{
      url: "/images/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Spencer Grey Art"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Spencer Grey | Limited Edition Fine Art Prints",
    description: "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
    creator: "@spencergreyart",
    images: ["/images/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${playfair.variable} antialiased min-h-screen flex flex-col bg-white`}
      >
        <CartProvider>
          <DefaultJsonLd />
          <SEOHead />
          <Header />
          <CartOverlay />
          <CartDrawer />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
