"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the cart item type
export interface CartItem {
  id: string;
  title: string;
  size: string;
  sizeDisplay: string; // For display purposes (e.g., "60x60cm (23.6x23.6in)")
  price: number;
  quantity: number;
  imageUrl: string;
}

// Define the cart context type
interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

// Create the cart context with default values
const CartContext = createContext<CartContextType>({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
});

/**
 * Custom hook to use the cart context
 * @returns Cart context values and functions
 */
export const useCart = () => useContext(CartContext);

/**
 * Cart provider component that manages the shopping cart state
 * @param children - React children
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('spencerGreyCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('spencerGreyCart', JSON.stringify(cartItems));
    
    // Calculate total items and subtotal
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setTotalItems(itemCount);
    setSubtotal(cartSubtotal);
  }, [cartItems]);

  // Effect for managing body scroll locking when cart is open
  useEffect(() => {
    if (isOpen) {
      // Lock the body scroll when cart is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore normal scrolling when cart is closed
      document.body.style.overflow = '';
    }
    
    // Cleanup function to ensure scroll is restored if component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cart functions
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(!isOpen);

  /**
   * Add an item to the cart
   * @param newItem - The item to add to the cart
   */
  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
      // Check if the item with the same id and size already exists
      const existingItemIndex = prevItems.findIndex(
        item => item.id === newItem.id && item.size === newItem.size
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, newItem];
      }
    });
    
    // Open the cart when an item is added
    openCart();
  };

  /**
   * Remove an item from the cart
   * @param id - Item ID
   * @param size - Item size
   */
  const removeFromCart = (id: string, size: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === size))
    );
  };

  /**
   * Update the quantity of an item in the cart
   * @param id - Item ID
   * @param size - Item size
   * @param quantity - New quantity
   */
  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.id === id && item.size === size) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Provide the cart context to children
  return (
    <CartContext.Provider
      value={{
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};