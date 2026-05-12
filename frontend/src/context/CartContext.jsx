import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/api';

const CartContext = createContext();

const EMPTY_CART = { items: [], totalItems: 0, subtotal: 0 };
const CART_UPDATED_EVENT = 'nexont:cart-updated';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Escuchar cambios de token (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('user-updated', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('user-updated', handleAuthChange);
    };
  }, []);

  const getLocalCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('anonCart');
      return stored ? JSON.parse(stored) : EMPTY_CART;
    } catch {
      return EMPTY_CART;
    }
  }, []);

  const saveLocalCart = useCallback((cartData) => {
    try { localStorage.setItem('anonCart', JSON.stringify(cartData)); } catch {}
  }, []);

  const emitCartUpdated = useCallback((cartData) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: cartData }));
  }, []);

  const setCartState = useCallback((cartData, options = {}) => {
    const { persistLocal = false, clearLocal = false } = options;
    if (persistLocal) saveLocalCart(cartData);
    if (clearLocal) {
      try { localStorage.removeItem('anonCart'); } catch {}
    }
    setCart(cartData);
    emitCartUpdated(cartData);
  }, [emitCartUpdated, saveLocalCart]);

  const normalizeBackendCart = useCallback((data) => ({
    items: (data.items || []).map(item => ({
      productId: item.product?.id ?? item.productId,
      quantity:  item.quantity,
      product:   item.product,
    })),
    totalItems: data.totalItems || 0,
    subtotal:   Number(data.subtotal || 0),
  }), []);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartState(getLocalCart());
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/cart');
      setCartState(normalizeBackendCart(data), { clearLocal: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setCartState(getLocalCart());
      } else {
        setError(err.response?.data?.error || 'No se pudo cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  }, [token, getLocalCart, setCartState, normalizeBackendCart]);

  const syncCartOnLogin = useCallback(async (authToken) => {
    const localCart = getLocalCart();
    if (localCart.items.length === 0) return;
    try {
      for (const item of localCart.items) {
        await api.post('/cart', { productId: item.productId, quantity: item.quantity }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
      const { data } = await api.get('/cart', { headers: { Authorization: `Bearer ${authToken}` } });
      setCartState(normalizeBackendCart(data), { clearLocal: true });
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  }, [getLocalCart, setCartState, normalizeBackendCart]);

  // Cargar al montar o al cambiar token
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sincronizar si hay items locales al loguearse
  useEffect(() => {
    if (token && getLocalCart().items.length > 0) {
      syncCartOnLogin(token);
    }
  }, [token, getLocalCart, syncCartOnLogin]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setError(''); setSuccess('');
      if (!token) {
        const localCart = getLocalCart();
        const existingIdx = localCart.items.findIndex(i => i.productId === productId);
        if (existingIdx > -1) {
          localCart.items[existingIdx].quantity += quantity;
        } else {
          localCart.items.push({ productId, quantity });
        }
        // Nota: En modo local no tenemos los datos del producto completos aquí.
        const totalItems = localCart.items.reduce((acc, i) => acc + i.quantity, 0);
        setCartState({ ...localCart, totalItems }, { persistLocal: true });
        setSuccess('Producto añadido al carrito');
      } else {
        await api.post('/cart', { productId, quantity });
        await fetchCart();
        setSuccess('Producto añadido al carrito');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al añadir al carrito');
    }
  }, [token, getLocalCart, setCartState, fetchCart]);

  const updateCartQuantity = useCallback(async (productId, quantity) => {
    try {
      setError('');
      if (!token) {
        const localCart = getLocalCart();
        const item = localCart.items.find(i => i.productId === productId);
        if (item) {
          item.quantity = quantity;
          setCartState(localCart, { persistLocal: true });
        }
      } else {
        await api.put(`/cart/${productId}`, { quantity });
        await fetchCart();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar cantidad');
    }
  }, [token, getLocalCart, setCartState, fetchCart]);

  const removeCartItem = useCallback(async (productId) => {
    try {
      setError('');
      if (!token) {
        const localCart = getLocalCart();
        localCart.items = localCart.items.filter(i => i.productId !== productId);
        setCartState(localCart, { persistLocal: true });
      } else {
        await api.delete(`/cart/${productId}`);
        await fetchCart();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar producto');
    }
  }, [token, getLocalCart, setCartState, fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      setError('');
      if (!token) {
        setCartState(EMPTY_CART, { persistLocal: true });
      } else {
        await api.delete('/cart/clear');
        setCartState(EMPTY_CART);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al vaciar el carrito');
    }
  }, [token, setCartState]);

  const value = useMemo(() => ({
    cart, loading, error, success,
    fetchCart, addToCart, updateCartQuantity,
    removeCartItem, clearCart, syncCartOnLogin,
    setError, setSuccess
  }), [cart, loading, error, success, fetchCart, addToCart, updateCartQuantity, removeCartItem, clearCart, syncCartOnLogin]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
