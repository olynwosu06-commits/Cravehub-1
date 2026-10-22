import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Map a populated cart document → flat array for the frontend
  // Map a populated cart document → flat array for the frontend
  const mapServerCart = (serverCart) => {
    if (!serverCart?.items) return [];
    
    return serverCart.items
      .filter((entry) => entry.menuItemId !== null) // 👈 Ignore deleted products
      .map((entry) => ({
        ...entry.menuItemId,
        quantity: entry.quantity,
        cartItemId: entry.menuItemId._id,
      }));
  };

  // Initial fetch on mount
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/cart');
      setCartItems(mapServerCart(data));
    } catch (err) {
      console.error('Failed to load cart:', err);
      showToast('Could not load your cart', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCart();
  }, [loadCart, user]);

  // Add to cart (or bump quantity if it exists)
  const addToCart = async (item) => {
    const existing = cartItems.find((c) => c._id === item._id || c.id === item.id);

    // Optimistic update — instant UI feedback
    setCartItems((current) => {
      const found = current.find((c) => c._id === item._id || c.id === item.id);
      if (found) {
        return current.map((c) =>
          c._id === item._id || c.id === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });

    showToast(
      existing ? `${item.name} quantity updated` : `${item.name} added to cart`,
      'success'
    );

    try {
      const { data } = await api.post('/api/cart/add', {
        menuItemId: item._id,   // must be the Mongo _id
        quantity: 1,
      });
      setCartItems(mapServerCart(data));
    } catch (err) {
      console.error('Add to cart failed:', err);
      showToast('Failed to add to cart', 'error');
      loadCart(); // roll back by refetching the truth
    }
  };

  // Change quantity (0 removes)
  const updateQuantity = async (menuItemId, quantity) => {
    // Optimistic update
    setCartItems((current) =>
      quantity <= 0
        ? current.filter((c) => c._id !== menuItemId)
        : current.map((c) =>
            c._id === menuItemId ? { ...c, quantity } : c
          )
    );

    try {
      const { data } = await api.patch('/api/cart/update', {
        menuItemId,
        quantity,
      });
      setCartItems(mapServerCart(data));
    } catch (err) {
      console.error('Update quantity failed:', err);
      showToast('Failed to update quantity', 'error');
      loadCart();
    }
  };

  // Remove item
  const removeFromCart = async (menuItemId) => {
    const item = cartItems.find((c) => c._id === menuItemId);

    // Optimistic
    setCartItems((current) => current.filter((c) => c._id !== menuItemId));

    if (item) showToast(`${item.name} removed from cart`, 'info');

    try {
      const { data } = await api.delete(`/api/cart/remove/${menuItemId}`);
      setCartItems(mapServerCart(data));
    } catch (err) {
      console.error('Remove failed:', err);
      showToast('Failed to remove item', 'error');
      loadCart();
    }
  };

  // Clear cart
  const clearCart = async () => {
    // Optimistic
    setCartItems([]);
    showToast('Cart cleared', 'info');

    try {
      await api.delete('/api/cart/clear');
    } catch (err) {
      console.error('Clear failed:', err);
      showToast('Failed to clear cart', 'error');
      loadCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}