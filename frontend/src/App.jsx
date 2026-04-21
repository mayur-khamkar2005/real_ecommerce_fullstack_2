import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Store from './pages/Store';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserOrders from './pages/UserOrders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Games from './pages/Games';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import SuggestionAgent from './components/SuggestionAgent';

// Determine which pages hide the Navbar/Footer
const HIDE_CHROME_PATHS = ['/login', '/register'];

const AppShell = () => {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_PATHS.includes(location.pathname);
  const isAdmin = location.pathname.startsWith('/admin');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-main)' }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border animate-pulse"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-2xl font-black tracking-tight">M</span>
          </div>
          <div className="mt-5 text-2xl font-extrabold tracking-tight">
            Welcome to <span style={{ color: 'var(--secondary)' }}>M‑Store</span>
          </div>
          <div className="mt-2 text-sm opacity-70">Loading your store…</div>
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--secondary)', animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-main)' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          },
          duration: 4000,
        }}
      />

      {/* Single, always-mounted Navbar — conditionally visible */}
      {!hideChrome && <Navbar />}

      <main className="flex-grow" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-main)' }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User (protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<UserOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/games" element={<Games />} />
            <Route path="/wallet" element={<Wallet />} />
          </Route>

          {/* Admin (protected + admin) */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </main>

      {/* Single Footer — hidden on auth & admin pages */}
      {!hideChrome && !isAdmin && <Footer />}

      {/* Floating chat-based product suggestion agent */}
      <SuggestionAgent />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppShell />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
