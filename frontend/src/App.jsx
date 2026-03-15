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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/tienda" element={<Navigate to="/" replace />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;