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
  title: "Spencer Grey | Limited Edition Fine Art Prints",
  description: "Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.",
  keywords: ["Spencer Grey", "fine art", "limited edition prints", "art prints", "minimalist art"],
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
