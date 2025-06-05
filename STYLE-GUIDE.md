# Spencer Grey Art - Style Guide

This style guide is inspired by the Lumos framework methodology, focusing on consistent, scalable design with fluid responsiveness and reusable components. It serves as the source of truth for the Spencer Grey artist website design system.

## Table of Contents
- [Design Principles](#design-principles)
- [Typography](#typography)
- [Color System](#color-system)
- [Layout & Spacing](#layout--spacing)
- [Component System](#component-system)
- [Utility Classes](#utility-classes)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)

## Design Principles

The Spencer Grey website adheres to the following design principles:

1. **Minimalism**: Let the artwork be the star. Use clean, simple layouts with generous whitespace.
2. **Consistency**: Maintain consistent visual language throughout the site.
3. **Fluidity**: Embrace fluid typography and spacing that scales smoothly across device sizes.
4. **Modularity**: Build with reusable components that maintain consistent styling.
5. **Accessibility**: Ensure the site is usable by everyone, regardless of abilities.

## Typography

### Font Families

We use a dual-typeface approach:

```css
--font-serif: "Cardinal Fruit", ui-serif, Georgia, serif;
--font-sans: "Suisse Intl", ui-sans-serif, system-ui, sans-serif;
```

- **Serif Font**: Used for headings, titles, and artistic statements
- **Sans-Serif Font**: Used for body text, navigation, and UI elements

### Font Weight System

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Fluid Type Scale

Our typography uses a fluid type scale that automatically adjusts based on viewport width, rather than fixed breakpoints:

```css
--text-xs: clamp(0.75rem, 0.7vw + 0.6rem, 0.875rem);
--text-sm: clamp(0.875rem, 0.8vw + 0.7rem, 1rem);
--text-base: clamp(1rem, 1vw + 0.8rem, 1.125rem);
--text-lg: clamp(1.125rem, 1.2vw + 0.9rem, 1.25rem);
--text-xl: clamp(1.25rem, 1.5vw + 1rem, 1.5rem);
--text-2xl: clamp(1.5rem, 2vw + 1.1rem, 2rem);
--text-3xl: clamp(1.875rem, 2.5vw + 1.2rem, 2.5rem);
--text-4xl: clamp(2.25rem, 3vw + 1.5rem, 3rem);
--text-5xl: clamp(3rem, 4vw + 1.8rem, 4rem);
```

### Text Style Classes

Apply consistent text styles using utility classes:

- `u-text-display`: Large, impactful display text
- `u-text-h1` through `u-text-h6`: Heading styles
- `u-text-body-large`: Larger body text
- `u-text-body`: Default paragraph text
- `u-text-body-small`: Smaller body text
- `u-text-caption`: Caption text for images, etc.

### Line Height & Letter Spacing

```css
--line-height-tight: 1.1;
--line-height-snug: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;

--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0em;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
--letter-spacing-widest: 0.1em;
```

## Color System

### Core Palette

```css
/* Background color: Light cream/off-white */
--color-background: #F6F4F0;

/* Text color: Deep navy/almost black */
--color-text: #020312;

/* Accent color: Black */
--color-accent: #000000;

/* Muted colors */
--color-muted-bg: #F1F1F1;
--color-muted-text: #737373;

/* Border colors */
--color-border: #E5E5E5;
--color-border-dark: #CCCCCC;

/* Form input colors */
--color-input: #E5E5E5;
--color-input-focus: #000000;

/* Status colors */
--color-success: #4CAF50;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-info: #3B82F6;
```

### Theme Variables

```css
/* Light theme (default) */
--theme-bg: var(--color-background);
--theme-text: var(--color-text);
--theme-accent: var(--color-accent);
--theme-border: var(--color-border);

/* Dark theme (for future implementation) */
.u-theme-dark {
  --theme-bg: #121212;
  --theme-text: #F6F4F0;
  --theme-accent: #FFFFFF;
  --theme-border: #333333;
}
```

### Button Style Variables

```css
/* Primary button */
--button-primary-bg: var(--color-accent);
--button-primary-text: white;
--button-primary-hover-bg: #333333;

/* Secondary button */
--button-secondary-bg: transparent;
--button-secondary-text: var(--color-text);
--button-secondary-border: var(--color-border-dark);
--button-secondary-hover-bg: #F1F1F1;
```

## Layout & Spacing

### Container System

```css
--container-max-width: 1440px;
--container-padding-x: clamp(1rem, 5vw, 2rem);
```

### Section Spacing

```css
--section-spacing-sm: clamp(2rem, 5vw, 3rem);
--section-spacing-md: clamp(3rem, 8vw, 5rem);
--section-spacing-lg: clamp(5rem, 10vw, 8rem);
--section-spacing-xl: clamp(8rem, 15vw, 12rem);
```

### Spacing Scale

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
--space-16: 4rem;
--space-20: 5rem;
--space-24: 6rem;
--space-32: 8rem;
--space-40: 10rem;
--space-48: 12rem;
```

### Grid System

We use a 12-column grid system with CSS Grid:

```css
--grid-columns: 12;
--grid-gap: var(--space-4);
```

### Aspect Ratios

```css
--ratio-square: 1/1;
--ratio-portrait: 3/4;
--ratio-landscape: 4/3;
--ratio-widescreen: 16/9;
--ratio-ultrawide: 21/9;
--ratio-golden: 1.618/1;
```

## Component System

### Component Naming Convention

- Component classes use snake_case with a semantic prefix
- Global components use `g_` prefix (e.g., `g_container`)
- Section-specific components use descriptive prefixes (e.g., `hero_`, `card_`, `footer_`)
- Component variants use a descriptive suffix (e.g., `_primary`, `_large`)

### Core Components

#### Container

```html
<div class="g_container">
  <!-- Content here -->
</div>
```

#### Section

```html
<section class="section_wrap">
  <div class="g_container">
    <div class="section_content">
      <!-- Content here -->
    </div>
  </div>
</section>
```

#### Button

```html
<button class="button_primary">
  <span class="button_text">Click Me</span>
</button>
```

#### Card

```html
<div class="card_wrap">
  <div class="card_image">
    <!-- Image here -->
  </div>
  <div class="card_content">
    <h3 class="card_title">Title</h3>
    <p class="card_description">Description</p>
  </div>
</div>
```

### Component Structure

Each component should follow this structure:

1. **Wrapper**: The outermost element with the main component class
2. **Container**: For layout and positioning (if needed)
3. **Content**: For the actual content
4. **Elements**: Individual elements within the component

## Utility Classes

### Display & Visibility

- `u-block`: `display: block`
- `u-inline`: `display: inline`
- `u-inline-block`: `display: inline-block`
- `u-flex`: `display: flex`
- `u-grid`: `display: grid`
- `u-hidden`: `display: none`
- `u-visible`: `visibility: visible`
- `u-invisible`: `visibility: hidden`

### Flex Utilities

- `u-flex-row`: `flex-direction: row`
- `u-flex-col`: `flex-direction: column`
- `u-flex-wrap`: `flex-wrap: wrap`
- `u-flex-nowrap`: `flex-wrap: nowrap`
- `u-items-start`: `align-items: flex-start`
- `u-items-center`: `align-items: center`
- `u-items-end`: `align-items: flex-end`
- `u-justify-start`: `justify-content: flex-start`
- `u-justify-center`: `justify-content: center`
- `u-justify-end`: `justify-content: flex-end`
- `u-justify-between`: `justify-content: space-between`
- `u-justify-around`: `justify-content: space-around`

### Grid Utilities

- `u-grid-cols-1` through `u-grid-cols-12`: Sets grid template columns
- `u-col-span-1` through `u-col-span-12`: Sets grid column span
- `u-col-start-1` through `u-col-start-12`: Sets grid column start
- `u-col-end-1` through `u-col-end-12`: Sets grid column end

### Spacing Utilities

- `u-m-0` through `u-m-48`: Sets margin
- `u-mt-0` through `u-mt-48`: Sets margin-top
- `u-mr-0` through `u-mr-48`: Sets margin-right
- `u-mb-0` through `u-mb-48`: Sets margin-bottom
- `u-ml-0` through `u-ml-48`: Sets margin-left
- `u-mx-0` through `u-mx-48`: Sets margin-left and margin-right
- `u-my-0` through `u-my-48`: Sets margin-top and margin-bottom
- `u-p-0` through `u-p-48`: Sets padding
- `u-pt-0` through `u-pt-48`: Sets padding-top
- `u-pr-0` through `u-pr-48`: Sets padding-right
- `u-pb-0` through `u-pb-48`: Sets padding-bottom
- `u-pl-0` through `u-pl-48`: Sets padding-left
- `u-px-0` through `u-px-48`: Sets padding-left and padding-right
- `u-py-0` through `u-py-48`: Sets padding-top and padding-bottom

### Text Utilities

- `u-text-left`: `text-align: left`
- `u-text-center`: `text-align: center`
- `u-text-right`: `text-align: right`
- `u-text-justify`: `text-align: justify`
- `u-text-uppercase`: `text-transform: uppercase`
- `u-text-lowercase`: `text-transform: lowercase`
- `u-text-capitalize`: `text-transform: capitalize`
- `u-font-serif`: `font-family: var(--font-serif)`
- `u-font-sans`: `font-family: var(--font-sans)`
- `u-font-light`: `font-weight: var(--font-weight-light)`
- `u-font-regular`: `font-weight: var(--font-weight-regular)`
- `u-font-medium`: `font-weight: var(--font-weight-medium)`
- `u-font-semibold`: `font-weight: var(--font-weight-semibold)`
- `u-font-bold`: `font-weight: var(--font-weight-bold)`

### Color Utilities

- `u-text-default`: `color: var(--theme-text)`
- `u-text-muted`: `color: var(--color-muted-text)`
- `u-text-accent`: `color: var(--color-accent)`
- `u-bg-default`: `background-color: var(--theme-bg)`
- `u-bg-muted`: `background-color: var(--color-muted-bg)`
- `u-bg-accent`: `background-color: var(--color-accent)`

### Border Utilities

- `u-border`: `border: 1px solid var(--theme-border)`
- `u-border-t`: `border-top: 1px solid var(--theme-border)`
- `u-border-r`: `border-right: 1px solid var(--theme-border)`
- `u-border-b`: `border-bottom: 1px solid var(--theme-border)`
- `u-border-l`: `border-left: 1px solid var(--theme-border)`
- `u-rounded-none`: `border-radius: 0`
- `u-rounded-sm`: `border-radius: 0.125rem`
- `u-rounded`: `border-radius: 0.25rem`
- `u-rounded-md`: `border-radius: 0.375rem`
- `u-rounded-lg`: `border-radius: 0.5rem`
- `u-rounded-full`: `border-radius: 9999px`

## Responsive Design

### Container Queries

Instead of fixed breakpoints, we use container queries where possible:

```css
.container {
  container-type: inline-size;
}

@container (min-width: 30em) {
  /* Styles for containers wider than 30em */
}

@container (min-width: 60em) {
  /* Styles for containers wider than 60em */
}
```

### Viewport Breakpoints

When container queries aren't suitable, we use these viewport breakpoints:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Utilities

- `u-hidden-sm`: Hidden below small breakpoint
- `u-hidden-md`: Hidden below medium breakpoint
- `u-hidden-lg`: Hidden below large breakpoint
- `u-hidden-xl`: Hidden below extra-large breakpoint
- `u-visible-sm`: Visible only below small breakpoint
- `u-visible-md`: Visible only below medium breakpoint
- `u-visible-lg`: Visible only below large breakpoint
- `u-visible-xl`: Visible only below extra-large breakpoint

## Accessibility

### Focus States

All interactive elements should have clear focus states:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Color Contrast

- All text should have a minimum contrast ratio of 4.5:1 against its background
- Large text (18pt or 14pt bold) should have a minimum contrast ratio of 3:1
- UI components and graphical objects should have a minimum contrast ratio of 3:1

### Screen Reader Utilities

- `u-sr-only`: Visually hidden but accessible to screen readers
- `u-not-sr-only`: Reverses the `u-sr-only` utility

### Motion Preferences

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

This style guide should be used as the source of truth for all design decisions on the Spencer Grey website. It ensures consistency, maintainability, and a cohesive user experience across all pages and components.
