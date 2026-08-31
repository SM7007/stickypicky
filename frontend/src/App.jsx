import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Customer Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

// Route guards
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Customer Routes */}
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminEditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111111',
              color: '#ffffff',
              border: '1px solid #1e1e1e',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
