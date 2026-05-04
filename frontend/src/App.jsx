import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import MyProducts from './pages/MyProducts';
import Cart from './pages/Cart';
import AssistedRecommendations from './pages/AssistedRecommendations';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import ChatWidget from './components/ChatWidget';
import SellerProfile from './pages/SellerProfile';

function App() {
  const [stripePromise, setStripePromise] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const initStripe = async () => {
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      
      if (stripePublicKey && stripePublicKey.length > 20 && stripePublicKey.startsWith('pk_')) {
        // Usar Stripe real
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(stripePublicKey);
        setStripePromise(stripe);
        console.log('✓ Stripe real cargado');
      } else {
        // Usar mock
        const mockModule = await import('./config/stripe-mock');
        const mockStripe = await mockModule.loadStripe();
        setStripePromise(mockStripe);
        console.log('🎭 Stripe Mock cargado (modo educativo)');
      }
      
      setIsReady(true);
    };

    initStripe();
  }, []);

  if (!isReady) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/tienda" element={<Navigate to="/" replace />} />
          <Route path="/recomendados" element={<AssistedRecommendations />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Elements stripe={stripePromise}><Orders /></Elements></PrivateRoute>} />
          <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Elements stripe={stripePromise}><Cart /></Elements></PrivateRoute>} />
        </Routes>
      </BrowserRouter>

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 999,
            background: '#2d6cdf', color: '#fff', border: 'none',
            borderRadius: '50%', width: 64, height: 64,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            fontSize: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="Abrir chat"
        >
          💬
        </button>
      )}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}
    </>
  );
}

export default App;