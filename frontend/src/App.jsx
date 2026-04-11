
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import MyProducts from './pages/MyProducts';
import Cart from './pages/Cart';
import PrivateRoute from './components/PrivateRoute';
import ChatWidget from './components/ChatWidget';
import SellerProfile from './pages/SellerProfile';


function App() {
  const [showChat, setShowChat] = useState(false);
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
          <Route path="/seller/:sellerId" element={<SellerProfile />} />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
      {/* Botón flotante para abrir el chat */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 999,
            background: '#2d6cdf',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 64,
            height: 64,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            fontSize: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="Abrir chat"
        >
          💬
        </button>
      )}
      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}
    </>
  );
}

export default App;