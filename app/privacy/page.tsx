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
        <p className="text-sm text-[#020312]/50 mb-12">Last updated: January 2025</p>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">What We Collect</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>When you place an order, we collect your name, email address, shipping address, and payment information. Payment data is processed securely through Stripe and is never stored on our servers.</p>
            <p>We may also collect basic usage data (pages visited, browser type) to improve the site. This is collected anonymously.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">How We Use It</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>Your information is used to fulfill orders, send shipping updates, and respond to inquiries. We do not sell or share your data with third parties for marketing purposes.</p>
            <p>If you opt in, we may send occasional emails about new artwork or limited releases. You can unsubscribe at any time.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Cookies</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We use essential cookies to keep your shopping cart working and to remember your session. We do not use third-party advertising cookies.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Your Rights</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>You can request a copy of your personal data, ask us to correct inaccuracies, or request deletion at any time. Email us through the contact page to make a request.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#020312] mb-4">Third-Party Services</h2>
          <div className="space-y-4 text-sm text-[#020312]/70 leading-relaxed">
            <p>We use Stripe for payment processing and Supabase for secure data storage. Both services maintain their own privacy policies and security standards.</p>
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
