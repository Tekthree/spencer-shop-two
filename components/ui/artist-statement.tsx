"use client";

import { useEffect, useState, useRef } from 'react';

interface ArtistStatementProps {
  text: string;
  className?: string;
}

/**
 * ArtistStatement component
 * A specialized component that ensures the Cardinal Fruit font is properly loaded and applied
 */
export default function ArtistStatement({ text, className = "" }: ArtistStatementProps) {
  const [fontLoaded, setFontLoaded] = useState(false);
  const statementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Check if the font is already loaded
    if (document.fonts && document.fonts.check("1em 'Cardinal Fruit'")) {
      setFontLoaded(true);
      return;
    }

    // Create a font face observer
    const fontObserver = new FontFace(
      'Cardinal Fruit',
      `url('/Cardinal-Fruit-Regular.woff') format('woff')`
    );

    // Load the font and apply it when ready
    fontObserver.load()
      .then((loadedFont) => {
        // Add the font to the document
        document.fonts.add(loadedFont);
        console.log('Cardinal Fruit font loaded successfully');
        setFontLoaded(true);
        
        // Force apply the font to our element
        if (statementRef.current) {
          statementRef.current.style.fontFamily = "'Cardinal Fruit', serif";
        }
      })
      .catch((error) => {
        console.error('Failed to load Cardinal Fruit font:', error);
        // Fallback to serif font if Cardinal Fruit fails to load
        if (statementRef.current) {
          statementRef.current.style.fontFamily = "serif";
        }
      });

    // Cleanup
    return () => {
      // No cleanup needed
    };
  }, []);

  return (
    <p
      ref={statementRef}
      className={`mb-8 ${className}`}
      style={{
        fontFamily: fontLoaded ? "'Cardinal Fruit', serif" : "serif",
        fontSize: "1.875rem",
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
        color: "#020312",
        textAlign: "center",
        fontWeight: 400
      }}
    >
      {text}
    </p>
  );
}