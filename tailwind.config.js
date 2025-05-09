/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Background color: Light cream/off-white
        "background": "#F6F4F0",
        // Text color: Deep navy/almost black
        "foreground": "#020312",
        // Accent color: Black
        "accent": "#000000",
        // Additional utility colors
        "muted": {
          DEFAULT: "#f1f1f1",
          foreground: "#737373",
        },
        "border": "#e5e5e5",
        "input": "#e5e5e5",
        "ring": "#000000",
        "destructive": {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        // Sans-serif for body text and navigation
        "sans": ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Serif for headings and titles
        "serif": ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // Text hierarchy
        "heading-1": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-2": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-3": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "subheading": ["18px", { lineHeight: "1.5", fontWeight: "500" }],
        "body": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "button": ["14px", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.05em" }],
        "nav": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        // Section spacing
        "section-desktop": "120px",
        "section-tablet": "80px",
        "section-mobile": "60px",
        // Horizontal margins
        "margin-desktop": "10%",
        "margin-tablet": "8%",
        "margin-mobile": "5%",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [import("tailwindcss-animate")],
}