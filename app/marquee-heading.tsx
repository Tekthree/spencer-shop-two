import React from 'react';

/**
 * MarqueeHeading component
 * Displays the marquee heading with proper styling.
 * The word "Electric" uses the Clandy font.
 */
export default function MarqueeHeading() {
  const headline = (
    <>
      <span className="clandyFontOverride">Electric</span> Magnetic Cosmic Dragon Spencer Presence
    </>
  );

  return (
    <div className="marquee-container" data-component-name="HomePageClient">
      <div className="marquee-content">
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
      </div>
      <div className="marquee-content">
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          {headline}
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
      </div>
    </div>
  );
}
