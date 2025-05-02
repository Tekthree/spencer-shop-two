/**
 * Helper functions for handling price conversions and formatting
 */

/**
 * Ensures a price value is a number
 * Handles both string and number inputs
 * 
 * @param price - The price value which could be a string or number
 * @returns A number value suitable for the ProductCard component
 */
export function ensureNumericPrice(price: string | number | undefined): number | undefined {
  if (price === undefined) {
    return undefined;
  }
  
  if (typeof price === 'number') {
    return price;
  }
  
  // If it's a string, try to extract numeric value
  if (typeof price === 'string') {
    // Remove currency symbols, commas, etc.
    const numericString = price.replace(/[^0-9.-]+/g, '');
    const numericValue = parseFloat(numericString);
    
    // Return 0 if parsing failed
    if (isNaN(numericValue)) {
      return 0;
    }
    
    // If the string contains "from" or similar text, it's likely already in dollars
    // Otherwise, assume it's in cents
    if (price.toLowerCase().includes('from')) {
      return numericValue * 100; // Convert dollars to cents
    }
    
    return numericValue;
  }
  
  return 0;
}

/**
 * Formats a price for display
 * 
 * @param price - The price in cents
 * @returns Formatted price string
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined) {
    return 'Price on request';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
}
