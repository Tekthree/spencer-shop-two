import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Shipping times, packaging details, and return policy for Spencer Grey Art prints.',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-[#020312] mb-12">Shipping & Returns</h1>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Processing & Delivery</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>Each print is made to order. Most orders ship within 5–7 business days of purchase.</p>
            <p>Domestic delivery typically takes an additional 3–5 business days. International orders take 7–14 business days depending on destination.</p>
            <p>Once your order ships, you&apos;ll receive a tracking number via email.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Packaging</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>Prints are rolled in acid-free tissue paper, placed in a protective tube, and shipped in a sturdy outer box. We take care to ensure your print arrives in perfect condition.</p>
            <p>We ship carbon-neutral worldwide.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Returns</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We accept returns within 30 days of delivery for prints in original, undamaged condition. Custom framed prints are not eligible for return unless damaged in transit.</p>
            <p>To initiate a return, please contact us before sending anything back. We&apos;ll walk you through the process.</p>
            <p>Size exchanges are possible within 14 days of delivery, subject to availability. A price difference may apply when exchanging for a larger size.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Damaged Orders</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>If your print arrives damaged, photograph the damage and contact us within 48 hours of delivery. We&apos;ll arrange a replacement at no additional cost.</p>
          </div>
        </section>

        <div className="border-t border-[#020312]/10 pt-8 text-sm text-[#020312]/50">
          <p>Questions? <Link href="/contact" className="underline hover:text-[#020312] transition-colors">Get in touch</Link> or visit our <Link href="/faq" className="underline hover:text-[#020312] transition-colors">FAQ</Link>.</p>
        </div>
      </div>
    </main>
  );
}
