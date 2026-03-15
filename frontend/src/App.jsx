import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Catalog from './pages/Catalog'; // <-- NUEVO
import Orders from './pages/Orders';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
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

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Catalog /></PrivateRoute>} /> {/* <-- NUEVO */}
        <Route path="/products/my" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/products/add" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
