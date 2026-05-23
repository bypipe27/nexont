import { useCart } from '../context/CartContext';

// Este hook ahora actúa como un puente (proxy) hacia el CartContext global.
// Esto permite mantener la compatibilidad con todos los componentes que ya lo usan,
// pero eliminando la redundancia de peticiones a la API.

export const useHybridCart = () => {
  const cartContext = useCart();
  
  return {
    ...cartContext,
    // Alias para mantener compatibilidad si algún componente usa nombres específicos
    isAuthenticated: !!localStorage.getItem('token')
  };
};