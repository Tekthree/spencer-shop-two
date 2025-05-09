"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

// Define the form schema using Zod for validation
const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

// TypeScript type derived from the schema
type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      // In a real implementation, this would send the data to an API endpoint
      // For now, we'll simulate a successful submission
      console.log("Form data submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      reset();
    } catch (error) {
      setErrorMessage("There was an error submitting your message. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-16 md:mb-24">
        <h1 className="font-serif text-5xl md:text-6xl mb-12 text-[#020312]">GET IN TOUCH</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left Column - Contact Info */}
          <div>
            <p className="text-base leading-relaxed mb-12">
              We&apos;re here as guides on your journey. Whether you seek knowledge about our creations, 
              wish to share your experience, or need assistance with your chosen treasures, 
              we&apos;re present and attentive.
            </p>

            <div className="mb-10">
              <p className="text-[#020312]/70 mb-2">Email:</p>
              <a href="mailto:hello@spencergrey.com" className="text-[#020312] hover:underline">hello@spencergrey.com</a>
            </div>

            <div className="w-full h-px bg-gray-200 my-12"></div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Check out the FAQs</h2>
              <p className="text-base mb-4">
                I&apos;ve woven a tapestry of wisdom addressing questions about our offerings, 
                the journey of shipments, the cycle of returns, and the spaces between.
              </p>
              <Link 
                href="/faq" 
                className="text-base uppercase hover:underline"
              >
                VISIT THE FAQS
              </Link>
            </div>

            <div>
              <p className="text-[#020312]/70 mb-6">For press inquiries, collaboration requests, or questions about artwork, please use the contact form or email directly.</p>
              <p className="text-[#020312]/70">I aim to respond to all inquiries within 48 hours during business days.</p>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <h2 className="text-2xl font-serif mb-8 text-[#020312]">Contact Information</h2>
            <p className="text-base mb-8">
              Our contact vessel offers the clearest pathway for connection. 
              Please infuse the form below with your essence, and we&apos;ll respond as the moments unfold.
            </p>

            {isSuccess ? (
              <div className="bg-[#F6F4F0] border border-[#020312]/10 p-6 mb-8 text-center">
                <p className="text-green-800 font-medium mb-2">Thank you for your message!</p>
                <p className="text-green-700">I&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded">
                    <p className="text-red-800">{errorMessage}</p>
                  </div>
                )}
                
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    {...register("name")}
                    className={`w-full border ${errors.name ? 'border-red-300' : 'border-[#020312]/20'} p-4 focus:outline-none focus:ring-1 focus:ring-[#000000] bg-[#F6F4F0]`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    {...register("email")}
                    className={`w-full border ${errors.email ? 'border-red-300' : 'border-[#020312]/20'} p-4 focus:outline-none focus:ring-1 focus:ring-[#000000] bg-[#F6F4F0]`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    {...register("subject")}
                    className={`w-full border ${errors.subject ? 'border-red-300' : 'border-[#020312]/20'} p-4 focus:outline-none focus:ring-1 focus:ring-[#000000] bg-[#F6F4F0]`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
                
                <div>
                  <textarea
                    placeholder="Message"
                    rows={6}
                    {...register("message")}
                    className={`w-full border ${errors.message ? 'border-red-300' : 'border-[#020312]/20'} p-4 focus:outline-none focus:ring-1 focus:ring-[#000000] bg-[#F6F4F0]`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#000000] text-white py-4 px-8 w-full md:w-auto hover:bg-[#020312] transition-colors disabled:opacity-70 font-medium"
                >
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
