import React from 'react';

/**
 * MarqueeHeading component
 * Displays the "Love channeled through form" heading with proper styling
 * The word "Love" has only the L capitalized and uses Clandy font
 */
export default function MarqueeHeading() {
  return (
    <div className="marquee-container" data-component-name="HomePageClient">
      <div className="marquee-content">
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
      </div>
      <div className="marquee-content">
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
        <h1 className="text-5xl md:text-7xl text-[#020312] inline-block">
          <span className="clandyFontOverride">Love</span> channeled through form
        </h1>
        <span className="heading-dot" aria-hidden="true"></span>
      </div>
    </div>
  );
}
