import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useHybridCart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  const getLocalCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('anonCart');
      return stored ? JSON.parse(stored) : { items: [], totalItems: 0, subtotal: 0 };
    } catch {
      return { items: [], totalItems: 0, subtotal: 0 };
    }
  }, []);

  const saveLocalCart = useCallback((cartData) => {
    try { localStorage.setItem('anonCart', JSON.stringify(cartData)); } catch {}
  }, []);

  const calculateCartTotals = useCallback((items) => {
    const subtotal = items.reduce((acc, item) => {
      const price = Number(item.product?.price ?? item.product?.precio ?? 0);
      return acc + price * item.quantity;
    }, 0);
    return {
      items,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal: Number(subtotal.toFixed(2)),
    };
  }, []);

  // ─── Normalizar respuesta del backend ────────────────────────────────────────
  // El backend devuelve items con { id, quantity, product: { id, titulo, price, stock, imagenes } }
  const normalizeBackendCart = (data) => ({
    items: (data.items || []).map(item => ({
      // Guardar el productId explícitamente para usar en updates/deletes
      productId: item.product?.id ?? item.productId,
      quantity:  item.quantity,
      product:   item.product,
    })),
    totalItems: data.totalItems || 0,
    subtotal:   Number(data.subtotal || 0),
  });

  // ─── Cargar carrito ───────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart(getLocalCart());
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/cart');
      setCart(normalizeBackendCart(data));
      localStorage.removeItem('anonCart');
    } catch (err) {
      if (err.response?.status === 401) {
        setCart(getLocalCart());
      } else {
        setError(err.response?.data?.error || 'No se pudo cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  }, [token, getLocalCart]);

  // ─── Agregar al carrito ───────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1, productData = {}) => {
    try {
      setError(''); setSuccess('');
      if (!Number.isInteger(quantity) || quantity < 1) {
        setError('La cantidad debe ser un entero mayor o igual a 1');
        return;
      }
      if (!token) {
        const localCart = getLocalCart();
        const existing = localCart.items.find(i => i.productId === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          localCart.items.push({
            productId,
            quantity,
            product: { id: productId, titulo: productData.name || 'Producto', price: productData.price || 0 },
          });
        }
        const updated = calculateCartTotals(localCart.items);
        saveLocalCart(updated);
        setCart(updated);
        setSuccess('Producto agregado al carrito');
        return;
      }
      const { data } = await api.post('/cart/items', { productId, quantity });
      setCart(normalizeBackendCart(data));
      setSuccess('Producto agregado al carrito');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo agregar al carrito');
    }
  }, [token, getLocalCart, calculateCartTotals, saveLocalCart]);

  // ─── Actualizar cantidad ──────────────────────────────────────────────────────
  const updateCartQuantity = useCallback(async (productId, quantity) => {
    try {
      setError(''); setSuccess('');

      // Validar que productId sea un número válido
      const pid = parseInt(productId, 10);
      if (isNaN(pid)) {
        setError('ID de producto inválido');
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 0) {
        setError('La cantidad no puede ser negativa');
        return;
      }

      if (!token) {
        const localCart = getLocalCart();
        const item = localCart.items.find(i => i.productId === pid);
        if (!item) { setError('Producto no está en el carrito'); return; }
        if (quantity === 0) {
          localCart.items = localCart.items.filter(i => i.productId !== pid);
        } else {
          item.quantity = quantity;
        }
        const updated = calculateCartTotals(localCart.items);
        saveLocalCart(updated);
        setCart(updated);
        setSuccess('Cantidad actualizada');
        return;
      }

      const { data } = await api.patch(`/cart/items/${pid}`, { quantity });
      setCart(normalizeBackendCart(data));
      setSuccess('Cantidad actualizada');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar la cantidad');
    }
  }, [token, getLocalCart, calculateCartTotals, saveLocalCart]);

  // ─── Remover item ─────────────────────────────────────────────────────────────
  const removeCartItem = useCallback(async (productId) => {
    try {
      setError(''); setSuccess('');
      const pid = parseInt(productId, 10);
      if (isNaN(pid)) { setError('ID de producto inválido'); return; }

      if (!token) {
        const localCart = getLocalCart();
        localCart.items = localCart.items.filter(i => i.productId !== pid);
        const updated = calculateCartTotals(localCart.items);
        saveLocalCart(updated);
        setCart(updated);
        setSuccess('Producto removido del carrito');
        return;
      }
      const { data } = await api.delete(`/cart/items/${pid}`);
      setCart(normalizeBackendCart(data));
      setSuccess('Producto removido del carrito');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo remover el producto');
    }
  }, [token, getLocalCart, calculateCartTotals, saveLocalCart]);

  // ─── Limpiar carrito ──────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      setError(''); setSuccess('');
      if (!token) {
        localStorage.removeItem('anonCart');
        setCart({ items: [], totalItems: 0, subtotal: 0 });
        setSuccess('Carrito limpiado');
        return;
      }
      const { data } = await api.delete('/cart');
      setCart(normalizeBackendCart(data));
      setSuccess('Carrito limpiado');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo limpiar el carrito');
    }
  }, [token]);

  // ─── Sincronizar carrito al autenticar ────────────────────────────────────────
  const syncCartOnLogin = useCallback(async (authToken) => {
    try {
      const localCart = getLocalCart();
      if (localCart.items.length === 0) {
        const { data } = await api.get('/cart', { headers: { Authorization: `Bearer ${authToken}` } });
        setCart(normalizeBackendCart(data));
        localStorage.removeItem('anonCart');
        return;
      }
      try {
        const { data } = await api.post('/cart/sync', { items: localCart.items }, { headers: { Authorization: `Bearer ${authToken}` } });
        setCart(normalizeBackendCart(data));
        localStorage.removeItem('anonCart');
      } catch {
        for (const item of localCart.items) {
          try {
            await api.post('/cart/items', { productId: item.productId, quantity: item.quantity }, { headers: { Authorization: `Bearer ${authToken}` } });
          } catch {}
        }
        const { data } = await api.get('/cart', { headers: { Authorization: `Bearer ${authToken}` } });
        setCart(normalizeBackendCart(data));
        localStorage.removeItem('anonCart');
      }
    } catch {}
  }, [getLocalCart]);

  useEffect(() => { fetchCart(); }, [token]);

  useEffect(() => {
    if (token && getLocalCart().items.length > 0) syncCartOnLogin(token);
  }, [token]);

  return {
    cart, loading, error, success,
    isAuthenticated: !!token,
    fetchCart, addToCart, updateCartQuantity,
    removeCartItem, clearCart, syncCartOnLogin,
    setError, setSuccess,
  };
};