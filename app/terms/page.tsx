import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for purchasing from Spencer Grey Art.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-[#020312] mb-4">Terms & Conditions</h1>
        <p className="text-sm text-[#020312]/50 mb-12">Last updated: January 2025</p>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Overview</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>By using this website or placing an order, you agree to the terms below. These terms apply to all visitors, customers, and anyone who accesses spencergreyart.com.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Products & Pricing</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>All prints are limited edition. Once an edition sells out, it will not be reprinted. Prices are listed in USD and are subject to change without notice.</p>
            <p>Product images are as accurate as possible, but colors may vary slightly depending on your screen settings and the print medium.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Orders & Payment</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>By placing an order, you confirm that you are authorized to use the payment method provided. All payments are processed securely through Stripe.</p>
            <p>We reserve the right to cancel any order for reasons including pricing errors, stock issues, or suspected fraud. If we cancel your order, you will receive a full refund.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Shipping & Returns</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>See our <a href="/shipping" className="underline hover:text-[#020312] transition-colors">Shipping & Returns</a> page for full details on delivery times, packaging, and our return policy.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Intellectual Property</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>All artwork, images, and content on this site are the intellectual property of Spencer Grey. Purchasing a print does not transfer any copyright or reproduction rights. You may not reproduce, distribute, or use any artwork without written permission.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Limitation of Liability</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>Spencer Grey Art is not liable for any indirect or consequential damages arising from the use of this site or the purchase of products. Our liability is limited to the amount paid for the order in question.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Changes to These Terms</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We may update these terms from time to time. Continued use of the site after changes are posted means you accept the updated terms.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Contact</h2>
          <div className="text-sm text-[#020312]/70 leading-relaxed">
            <p>Questions? <a href="/contact" className="underline hover:text-[#020312] transition-colors">Get in touch</a>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
