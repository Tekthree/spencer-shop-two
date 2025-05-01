/**
 * Utility to calculate and set the scrollbar width as a CSS variable
 * This prevents content shift when the scrollbar is hidden
 */
export function setupScrollbarWidthDetection() {
  if (typeof window === 'undefined') return;
  
  // Calculate scrollbar width
  const calculateScrollbarWidth = () => {
    // Create a div with scrollbars
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    // Create an inner div
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    // Calculate the width difference
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    
    // Clean up
    outer.parentNode?.removeChild(outer);
    
    // Set the scrollbar width as a CSS variable
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  };
  
  // Calculate on load
  calculateScrollbarWidth();
  
  // Recalculate on resize
  window.addEventListener('resize', calculateScrollbarWidth);
}