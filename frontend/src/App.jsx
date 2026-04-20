import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
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
        <ThemeProvider>
          <Router>
            <AppShell />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
