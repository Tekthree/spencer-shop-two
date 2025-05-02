"use client";

import AnimatedPage from "@/components/ui/animated-page";

/**
 * AnimatedPageTemplate
 * This is a client component example showing how to implement page transitions
 * in Next.js 15 without using dynamic imports with ssr: false in server components
 */
export default function AnimatedPageTemplate() {
  return (
    <AnimatedPage>
      <div className="min-h-screen px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl mb-6">Animated Page Example</h1>
          <p className="mb-4">
            This is an example of how to implement page transitions in Next.js 15
            using Framer Motion without causing build errors.
          </p>
          <p>
            The key is to use the AnimatedPage component directly in client components
            without using dynamic imports with ssr: false in server components.
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
}
