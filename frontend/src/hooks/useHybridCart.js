import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Hook híbrido para manejo de carrito:
 * - LocalStorage cuando el usuario NO está autenticado
 * - Backend cuando el usuario SÍ está autenticado
 * - Sincronización automática al hacer login
 */
export const useHybridCart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  // ─── Obtener carrito local (localStorage) ───
  const getLocalCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('anonCart');
      return stored ? JSON.parse(stored) : { items: [], totalItems: 0, subtotal: 0 };
    } catch (err) {
      console.error('Error leyendo carrito local:', err);
      return { items: [], totalItems: 0, subtotal: 0 };
    }
  }, []);

  // ─── Guardar carrito local ───
  const saveLocalCart = useCallback((cartData) => {
    try {
      localStorage.setItem('anonCart', JSON.stringify(cartData));
    } catch (err) {
      console.error('Error guardando carrito local:', err);
    }
  }, []);

  // ─── Calcular subtotal ───
  const calculateCartTotals = useCallback((items) => {
    const subtotal = items.reduce((acc, item) => {
      const price = typeof item.product?.price === 'string' 
        ? parseFloat(item.product.price) 
        : item.product?.price || 0;
      return acc + (price * item.quantity);
    }, 0);

    return {
      items,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal: Number(subtotal.toFixed(2)),
    };
  }, []);

  // ─── Cargar carrito ───
  const fetchCart = useCallback(async () => {
    if (!token) {
      // Usuario anónimo: usar localStorage
      const localCart = getLocalCart();
      setCart(localCart);
      return;
    }

    // Usuario autenticado: traer del backend
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/cart');
      setCart({
        items: data.items || [],
        totalItems: data.totalItems || 0,
        subtotal: Number(data.subtotal || 0),
      });
      // Limpiar localStorage al cargar desde backend
      localStorage.removeItem('anonCart');
    } catch (err) {
      if (err.response?.status === 401) {
        // Token inválido, cambiar a localStorage
        const localCart = getLocalCart();
        setCart(localCart);
      } else {
        setError(err.response?.data?.error || 'No se pudo cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  }, [token, getLocalCart]);

  // ─── Agregar al carrito ───
  const addToCart = useCallback(
    async (productId, quantity = 1, productData = {}) => {
      try {
        setError('');
        setSuccess('');

        if (!Number.isInteger(quantity) || quantity < 1) {
          setError('La cantidad debe ser un entero mayor o igual a 1');
          return;
        }

        if (!token) {
          // Usuario anónimo: guardar en localStorage
          const localCart = getLocalCart();
          const existingItem = localCart.items.find((i) => i.productId === productId);

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            // Guardar con datos del producto si están disponibles
            localCart.items.push({
              productId,
              quantity,
              product: {
                id: productId,
                name: productData.name || 'Producto',
                price: productData.price || 0,
              },
            });
          }

          const updated = calculateCartTotals(localCart.items);
          saveLocalCart(updated);
          setCart(updated);
          setSuccess('Producto agregado al carrito');
          return;
        }

        // Usuario autenticado: enviar al backend
        const { data } = await api.post('/cart/items', { productId, quantity });
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        setSuccess('Producto agregado al carrito');
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo agregar al carrito');
      }
    },
    [token, getLocalCart, calculateCartTotals, saveLocalCart]
  );

  // ─── Actualizar cantidad ───
  const updateCartQuantity = useCallback(
    async (productId, quantity) => {
      try {
        setError('');
        setSuccess('');

        if (!Number.isInteger(quantity) || quantity < 0) {
          setError('La cantidad no puede ser negativa');
          return;
        }

        if (!token) {
          // Usuario anónimo: actualizar en localStorage
          const localCart = getLocalCart();
          const item = localCart.items.find((i) => i.productId === productId);

          if (!item) {
            setError('Producto no está en el carrito');
            return;
          }

          if (quantity === 0) {
            localCart.items = localCart.items.filter((i) => i.productId !== productId);
          } else {
            item.quantity = quantity;
          }

          const updated = calculateCartTotals(localCart.items);
          saveLocalCart(updated);
          setCart(updated);
          setSuccess('Cantidad actualizada');
          return;
        }

        // Usuario autenticado: enviar al backend
        const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        setSuccess('Cantidad actualizada');
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo actualizar la cantidad');
      }
    },
    [token, getLocalCart, calculateCartTotals, saveLocalCart]
  );

  // ─── Remover item ───
  const removeCartItem = useCallback(
    async (productId) => {
      try {
        setError('');
        setSuccess('');

        if (!token) {
          // Usuario anónimo: remover de localStorage
          const localCart = getLocalCart();
          localCart.items = localCart.items.filter((i) => i.productId !== productId);

          const updated = calculateCartTotals(localCart.items);
          saveLocalCart(updated);
          setCart(updated);
          setSuccess('Producto removido del carrito');
          return;
        }

        // Usuario autenticado: enviar al backend
        const { data } = await api.delete(`/cart/items/${productId}`);
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        setSuccess('Producto removido del carrito');
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo remover el producto');
      }
    },
    [token, getLocalCart, calculateCartTotals, saveLocalCart]
  );

  // ─── Limpiar carrito ───
  const clearCart = useCallback(async () => {
    try {
      setError('');
      setSuccess('');

      if (!token) {
        // Usuario anónimo: limpiar localStorage
        localStorage.removeItem('anonCart');
        setCart({ items: [], totalItems: 0, subtotal: 0 });
        setSuccess('Carrito limpiado');
        return;
      }

      // Usuario autenticado: enviar al backend
      const { data } = await api.delete('/cart');
      setCart({
        items: data.items || [],
        totalItems: data.totalItems || 0,
        subtotal: Number(data.subtotal || 0),
      });
      setSuccess('Carrito limpiado');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo limpiar el carrito');
    }
  }, [token]);

  // ─── Sincronizar carrito al autenticar ───
  const syncCartOnLogin = useCallback(async (authToken) => {
    try {
      const localCart = getLocalCart();
      
      if (localCart.items.length === 0) {
        // No hay carrito local, solo cargar el del backend
        const { data } = await api.get('/cart', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        localStorage.removeItem('anonCart');
        return;
      }

      // Hay carrito local: usar endpoint de sync
      try {
        const { data } = await api.post(
          '/cart/sync',
          { items: localCart.items },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        localStorage.removeItem('anonCart');
      } catch (syncErr) {
        // Si syncErr falla, agregar items uno por uno como fallback
        console.warn('Sync endpoint falló, sincronizando manualmente:', syncErr);
        for (const item of localCart.items) {
          try {
            await api.post(
              '/cart/items',
              { productId: item.productId, quantity: item.quantity },
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
          } catch (err) {
            console.error(`Error sincronizando producto ${item.productId}:`, err);
          }
        }

        // Obtener carrito final del backend
        const { data } = await api.get('/cart', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          subtotal: Number(data.subtotal || 0),
        });
        localStorage.removeItem('anonCart');
      }
    } catch (err) {
      console.error('Error sincronizando carrito:', err);
    }
  }, [getLocalCart]);

  // ─── Cargar carrito al montar componente ───
  useEffect(() => {
    fetchCart();
  }, [token]);

  // ─── Sincronizar automáticamente cuando se detecta un nuevo token ───
  useEffect(() => {
    if (token && getLocalCart().items.length > 0) {
      // Si hay token nuevo y carrito local, sincronizar
      syncCartOnLogin(token);
    }
  }, [token]);

  return {
    cart,
    loading,
    error,
    success,
    isAuthenticated: !!token,
    fetchCart,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    syncCartOnLogin,
    setError,
    setSuccess,
  };
};