# Spencer Grey Art - Style Transition Guide

This document outlines the process for transitioning from the current styling approach to our new Lumos-inspired design system as defined in `STYLE-GUIDE.md`.

## Table of Contents
- [Overview](#overview)
- [Transition Strategy](#transition-strategy)
- [Component Migration](#component-migration)
- [CSS Class Mapping](#css-class-mapping)
- [Implementation Checklist](#implementation-checklist)

## Overview

We've created a new Lumos-inspired styling system that emphasizes:
- Fluid typography and spacing
- Component-based architecture
- Utility-first approach
- Consistent naming conventions
- Improved accessibility

The transition will be gradual, allowing us to maintain functionality while improving the design system.

## Transition Strategy

### Phase 1: Strip Animations (Completed)
- Removed Framer Motion animations from layout components
- Created static alternatives for animated components
- Simplified cart drawer and overlay components

### Phase 2: Implement Core Framework (Current)
- Created comprehensive style guide (`STYLE-GUIDE.md`)
- Implemented CSS variables and utility classes (`lumos.css`)
- Updated global CSS imports

### Phase 3: Component Migration
- Migrate one component at a time
- Start with simpler, standalone components
- Update complex components last
- Test thoroughly after each migration

### Phase 4: Page-by-Page Refinement
- Apply new styling to each page
- Ensure consistent look and feel
- Address any responsive design issues

## Component Migration

When migrating a component, follow these steps:

1. **Analyze the component**
   - Identify current styling approach
   - Note any special behaviors or states

2. **Create a new version using Lumos classes**
   - Use component classes for structure (e.g., `card_wrap`)
   - Use utility classes for styling (e.g., `u-flex`, `u-mb-4`)

3. **Test the component**
   - Ensure it works across all breakpoints
   - Verify all states (hover, focus, active)
   - Check accessibility

4. **Replace the old component**
   - Update imports if necessary
   - Remove any unused styles

## CSS Class Mapping

Use this mapping to convert current styles to Lumos-inspired classes:

### Layout & Containers

| Current | Lumos Equivalent |
|---------|------------------|
| `container-spencer` | `g_container` |
| `section` | `section_wrap` |
| `flex` | `u-flex` |
| `grid` | `u-grid` |
| `justify-between` | `u-justify-between` |
| `items-center` | `u-items-center` |

### Typography

| Current | Lumos Equivalent |
|---------|------------------|
| `h1`, `.h1` | `u-text-h1` |
| `h2`, `.h2` | `u-text-h2` |
| `h3`, `.h3` | `u-text-h3` |
| `p` | `u-text-body` |
| `text-center` | `u-text-center` |
| `font-serif` | `u-font-serif` |
| `font-sans` | `u-font-sans` |

### Buttons

| Current | Lumos Equivalent |
|---------|------------------|
| `btn` | `button_primary` |
| `btn-outline` | `button_secondary` |
| `shop-button` | `button_primary` with appropriate modifiers |
| `add-to-cart-btn` | `button_primary` with appropriate modifiers |

### Spacing

| Current | Lumos Equivalent |
|---------|------------------|
| `mb-4` | `u-mb-4` |
| `mt-8` | `u-mt-8` |
| `p-4` | `u-p-4` |
| `px-6` | `u-px-6` |

## Implementation Checklist

Use this checklist to track progress on the transition:

### Core Components
- [ ] Header
- [ ] Footer
- [ ] Navigation
- [ ] Buttons
- [ ] Cards
- [ ] Form elements

### Page Layouts
- [ ] Home page
- [ ] Shop page
- [ ] Product detail page
- [ ] About page
- [ ] Contact page
- [ ] FAQ page
- [ ] Checkout pages

### Admin Components
- [ ] Admin dashboard
- [ ] Collection management
- [ ] Order management
- [ ] Content management

### Special Components
- [ ] Cart drawer
- [ ] Cart overlay
- [ ] Modals
- [ ] Alerts and notifications

## Best Practices

1. **Be consistent**
   - Follow the naming conventions in `STYLE-GUIDE.md`
   - Use component classes for structure, utility classes for styling

2. **Minimize custom CSS**
   - Use utility classes whenever possible
   - Create new utility classes if needed rather than one-off styles

3. **Maintain accessibility**
   - Ensure proper contrast ratios
   - Use semantic HTML
   - Test with keyboard navigation

4. **Document any deviations**
   - If you need to deviate from the style guide, document why
   - Update the style guide if necessary

5. **Test thoroughly**
   - Test on multiple devices and browsers
   - Verify responsive behavior
   - Check for visual regressions

By following this transition guide, we'll gradually improve the Spencer Grey website's design system while maintaining functionality and ensuring a consistent user experience.
