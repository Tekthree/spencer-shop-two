"use client";

import { useEffect, useState } from 'react';

export default function FontTestPage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontInfo, setFontInfo] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Check if fonts are loaded
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
      
      // Get information about loaded fonts
      const cardinalLoaded = document.fonts.check("1em 'Cardinal Fruit'");
      const suisseLoaded = document.fonts.check("1em 'Suisse Intl'");
      
      setFontInfo({
        cardinalLoaded: cardinalLoaded ? "Yes" : "No",
        suisseLoaded: suisseLoaded ? "Yes" : "No",
        availableFonts: Array.from(document.fonts)
          .map((font: any) => `${font.family} (${font.weight}, ${font.style})`)
          .filter((font, index, self) => self.indexOf(font) === index)
          .join(", ")
      });
    });
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl mb-8">Font Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl mb-4">Font Loading Status:</h2>
        <p>Fonts Ready: {fontsLoaded ? "Yes" : "No"}</p>
        <p>Cardinal Fruit Loaded: {fontInfo.cardinalLoaded || "Checking..."}</p>
        <p>Suisse Intl Loaded: {fontInfo.suisseLoaded || "Checking..."}</p>
        <p className="mt-4 text-sm">Available Fonts: {fontInfo.availableFonts || "Checking..."}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded">
          <h2 className="text-xl mb-4">Cardinal Fruit Test</h2>
          
          <div className="mb-6">
            <p className="text-sm mb-2">Direct Font Family:</p>
            <p style={{ fontFamily: "'Cardinal Fruit', serif" }} className="text-2xl">
              This text should use Cardinal Fruit
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm mb-2">Using Tailwind font-serif:</p>
            <p className="font-serif text-2xl">
              This text should use Cardinal Fruit via Tailwind
            </p>
          </div>
          
          <div>
            <p className="text-sm mb-2">Using CSS Variable:</p>
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-2xl">
              This text should use Cardinal Fruit via CSS variable
            </p>
          </div>
        </div>
        
        <div className="p-6 border rounded">
          <h2 className="text-xl mb-4">Suisse Intl Test</h2>
          
          <div className="mb-6">
            <p className="text-sm mb-2">Direct Font Family:</p>
            <p style={{ fontFamily: "'Suisse Intl', sans-serif" }} className="text-lg">
              This text should use Suisse Intl
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm mb-2">Using Tailwind font-sans:</p>
            <p className="font-sans text-lg">
              This text should use Suisse Intl via Tailwind
            </p>
          </div>
          
          <div>
            <p className="text-sm mb-2">Using CSS Variable:</p>
            <p style={{ fontFamily: "var(--font-sans)" }} className="text-lg">
              This text should use Suisse Intl via CSS variable
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 border rounded">
        <h2 className="text-xl mb-4">Heading Examples</h2>
        
        <h1 className="text-5xl mb-4">H1 Heading</h1>
        <h2 className="text-4xl mb-4">H2 Heading</h2>
        <h3 className="text-3xl mb-4">H3 Heading</h3>
        <h4 className="text-2xl mb-4">H4 Heading</h4>
        <p className="text-lg">Regular paragraph text</p>
      </div>
    </div>
  );
}