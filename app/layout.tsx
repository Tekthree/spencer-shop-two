import type { Metadata } from "next";
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

// Import debugging script - temporarily disabled
// import Script from "next/script";

// Custom fonts are loaded via @font-face in globals.css

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spencergrey.com";
const ogImagePath = "/images/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "Spencer Grey Art",
  category: "Art",
  title: {
    default: "Spencer Grey | Limited Edition Fine Art Prints",
    template: "%s | Spencer Grey Art",
  },
  description:
    "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
  keywords: [
    "Spencer Grey",
    "fine art",
    "limited edition prints",
    "art prints",
    "minimalist art",
    "contemporary artist",
    "gallery prints",
    "art collection",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Spencer Grey Art",
    title: "Spencer Grey | Limited Edition Fine Art Prints",
    description:
      "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
    url: baseUrl,
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "Spencer Grey Art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spencer Grey | Limited Edition Fine Art Prints",
    description:
      "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
    creator: "@spencergreyart",
    images: [ogImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#020312",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="/Cardinal-Fruit-Regular.woff" 
          as="font" 
          type="font/woff" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/Clandy-Regular.woff" 
          as="font" 
          type="font/woff" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/SuisseIntl-Regular.woff" 
          as="font" 
          type="font/woff" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/SuisseIntl-Light.woff" 
          as="font" 
          type="font/woff" 
          crossOrigin="anonymous" 
        />
      </head>
      <body
        className={`antialiased min-h-screen flex flex-col bg-[#F6F4F0]`}
      >
        <CartProvider>
          <DefaultJsonLd />
          <Header />
          <CartOverlay />
          <CartDrawer />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          {/* Debug script to help identify styling issues - temporarily disabled */}
          {/* <Script
            id="style-debugger"
            src="/debug-styles.js"
            strategy="afterInteractive"
          /> */}
        </CartProvider>
      </body>
    </html>
  );
}
