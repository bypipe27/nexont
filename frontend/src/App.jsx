import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import { useTheme } from './context/ThemeContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Orders = lazy(() => import('./pages/Orders'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyProducts = lazy(() => import('./pages/MyProducts'));
const Cart = lazy(() => import('./pages/Cart'));
const AssistedRecommendations = lazy(() => import('./pages/AssistedRecommendations'));
const Profile = lazy(() => import('./pages/Profile'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const ChatWidget = lazy(() => import('./components/ChatWidget'));

function App() {
  const [stripePromise, setStripePromise] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>}>
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
          <Footer />
          <HelpCenter />
        </Suspense>
      </BrowserRouter>

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 999,
            background: isDark ? '#ffffff' : '#000000',
            color: isDark ? '#09090b' : '#ffffff',
            border: 'none',
            borderRadius: '50%', width: 64, height: 64,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          aria-label="Abrir chat"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
          </svg>
        </button>
      )}
      {showChat && (
        <Suspense fallback={null}>
          <ChatWidget onClose={() => setShowChat(false)} />
        </Suspense>
      )}
    </>
  );
}

export default App;