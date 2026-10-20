import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Spencer Grey Art collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-[#020312] mb-4">Privacy Policy</h1>
        <p className="text-sm text-[#020312]/50 mb-12">Last updated: October 20, 2026</p>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">What We Collect</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>When you place an order, we collect your name and email address. For physical artwork, Stripe also collects your shipping address and phone number. Stripe processes your card information; Spencer Grey Art does not store full card numbers.</p>
            <p>Our hosting and security providers may process basic technical information such as IP address, browser type, request time, and error logs to operate and protect the site.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">How We Use It</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>Your information is used to process payments, fulfill orders, send order and shipping updates, prevent fraud, provide support, and maintain required business records. We do not sell personal information or share it with third parties for their own marketing.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Cookies</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>The shopping cart is stored in your browser. The private administrator area uses an essential, secure session cookie. We do not use third-party advertising cookies.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Your Rights</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>You may ask to access, correct, or delete personal information associated with you. Some records may need to be retained for tax, accounting, fraud-prevention, dispute, or other legal obligations. Contact us through the contact page to make a request; we may need to verify your identity.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Third-Party Services</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We use Stripe for payments, Neon for order and catalog data, Resend for transactional email, Cloudflare R2 for artwork images, and Vercel for website hosting. These providers process information as needed to deliver their services and maintain their own privacy and security practices.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Retention & Security</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We keep order records only as long as reasonably needed to fulfill purchases, provide support, maintain accurate edition records, and meet business or legal obligations. We use access controls, encrypted connections, and reputable service providers, but no online system can be guaranteed completely secure.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Contact</h2>
          <div className="text-sm text-[#020312]/70 leading-relaxed">
            <p>Questions about this policy? Reach us through the <a href="/contact" className="underline hover:text-[#020312] transition-colors">contact page</a>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
