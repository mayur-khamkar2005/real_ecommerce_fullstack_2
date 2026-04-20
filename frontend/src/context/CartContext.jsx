import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Track user._id specifically — prevents refetch when user object reference changes
  // but the actual logged-in user hasn't changed
  const userIdRef = useRef(null);

  const applyCartData = (data) => {
    setCart(data);
    const items = data?.items || [];
    setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
  };

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart');
      applyCartData(data.data);
    } catch {
      setCart(null);
      setCartCount(0);
    }
  }, []); // no deps — stable function reference forever

  useEffect(() => {
    const currentUserId = user?._id || null;

    // Only re-fetch if the user ID actually changed (login/logout)
    if (currentUserId === userIdRef.current) return;
    userIdRef.current = currentUserId;

    if (!currentUserId) {
      // User logged out — clear cart immediately
      setCart(null);
      setCartCount(0);
      setCartLoading(false);
      return;
    }

    // User logged in — fetch their cart
    let cancelled = false;
    setCartLoading(true);

    api.get('/cart')
      .then(({ data }) => {
        if (!cancelled) applyCartData(data.data);
      })
      .catch(() => {
        if (!cancelled) { setCart(null); setCartCount(0); }
      })
      .finally(() => {
        if (!cancelled) setCartLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: We intentionally check user._id inside the effect rather than using user._id
  // as dep, so we avoid issues with ESLint while still being referentially stable.

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      applyCartData(data.data);
      toast.success('Added to cart');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add to cart');
      return false;
    }
  }, [user]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      applyCartData(data.data);
    } catch {
      toast.error('Could not update quantity');
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      applyCartData(data.data);
      toast.success('Item removed');
    } catch {
      toast.error('Could not remove item');
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart(null);
    setCartCount(0);
  }, []);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
