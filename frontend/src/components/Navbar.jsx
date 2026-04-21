import { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, LogOut, User, Heart, Menu, X, ShoppingBag, Gift } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const CATEGORIES = ['Electronics', 'Fashion', 'Gaming', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Gadgets'];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    navigate(`/store?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--text-main)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="sticky top-0 z-50"
    >
      {/* ── Main Row ── */}
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <ShoppingBag size={22} style={{ color: 'var(--secondary)' }} />
          <span className="text-xl font-extrabold tracking-wide">
            <span className="text-white">M</span>
            <span className="mx-1 text-gray-400">–</span>
            <span style={{ color: 'var(--secondary)' }} className="italic">
              Store
            </span>
          </span>
        </Link>

        {/* Search — hidden on xs, visible md+ */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="flex w-full h-9">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
              className="border-r px-2 py-1 outline-none text-xs cursor-pointer rounded-l-md max-w-[130px] shrink-0"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products…"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' }}
              className="flex-1 min-w-0 px-3 py-1 text-sm outline-none"
            />
            <button
              type="submit"
              style={{ backgroundColor: 'var(--secondary)' }}
              className="text-white px-4 rounded-r-md shrink-0 flex items-center hover:opacity-90 transition-opacity"
              aria-label="Search"
            >
              <Search size={17} />
            </button>
          </div>
        </form>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/profile" style={{ color: 'var(--text-main)' }} className="flex flex-col px-2 py-1 hover:bg-white/10 rounded-md text-xs text-center">
                <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">Hello, {user.name?.split(' ')[0]}</span>
                <span className="font-bold">Account</span>
              </Link>
              <Link to="/my-orders" style={{ color: 'var(--text-main)' }} className="flex flex-col px-2 py-1 hover:bg-white/10 rounded-md text-xs text-center">
                <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">Returns</span>
                <span className="font-bold">& Orders</span>
              </Link>
              <Link to="/wishlist" style={{ color: 'var(--text-main)' }} className="p-2 hover:bg-white/10 rounded-md" title="Wishlist">
                <Heart size={20} strokeWidth={1.75} />
              </Link>
              <Link to="/games" style={{ color: 'var(--text-main)' }} className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-md text-xs uppercase tracking-wider">
                <Gift size={14} /> Play & Win
              </Link>
              <Link to="/wallet" style={{ color: 'var(--text-main)' }} className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-md text-xs uppercase tracking-wider">
                Wallet
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--secondary)' }} className="px-2 py-1 font-bold text-sm hover:bg-white/10 rounded-md uppercase tracking-wider">
                  Admin
                </Link>
              )}
              <Link to="/cart" style={{ color: 'var(--text-main)' }} className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-md relative">
                <div className="relative">
                  <ShoppingCart size={22} strokeWidth={1.75} />
                  {cartCount > 0 && (
                    <span style={{ backgroundColor: 'var(--secondary)' }} className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm">Cart</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{ color: 'var(--text-main)' }}
                className="p-2 hover:bg-white/10 rounded-md"
                title="Logout"
              >
                <LogOut size={20} strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-main)' }} className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-md">
                <User size={22} strokeWidth={1.75} />
                <div className="flex flex-col text-xs">
                  <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">Hello, sign in</span>
                  <span className="font-bold">Account</span>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Cart icon + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          {user && (
            <Link to="/cart" className="relative p-2" style={{ color: 'var(--text-main)' }}>
              <ShoppingCart size={22} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span style={{ backgroundColor: 'var(--secondary)' }} className="absolute top-0.5 right-0.5 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-main)' }}
            className="p-2 hover:bg-white/10 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Search ── */}
      <div className="md:hidden px-3 pb-2">
        <form onSubmit={handleSearch} className="flex w-full h-9">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search products…"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' }}
            className="flex-1 min-w-0 px-3 py-1 text-sm outline-none rounded-l-md"
          />
          <button
            type="submit"
            style={{ backgroundColor: 'var(--secondary)' }}
            className="text-white px-3 rounded-r-md shrink-0 flex items-center"
            aria-label="Search"
          >
            <Search size={17} />
          </button>
        </form>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: 'var(--primary-dark)', borderColor: 'var(--border)' }} className="md:hidden border-t px-4 py-4 flex flex-col gap-3 text-sm">
          {user ? (
            <>
              <div style={{ color: 'var(--text-muted)' }} className="text-xs uppercase tracking-widest pb-2 border-b border-white/10">
                Hello, {user.name?.split(' ')[0]}
              </div>
              <Link to="/profile" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/my-orders" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              <Link to="/wishlist" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
              <Link to="/games" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>Play & Win</Link>
              <Link to="/wallet" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wallet</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--secondary)' }} className="font-bold hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" style={{ color: 'var(--text-main)' }} className="hover:text-secondary transition-colors" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
            </>
          )}
          <div className="border-t border-white/10 pt-3">
            <p style={{ color: 'var(--text-muted)' }} className="text-xs uppercase tracking-widest mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { navigate(`/store?category=${encodeURIComponent(cat)}`); setMobileMenuOpen(false); }}
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' }}
                  className="text-xs px-2.5 py-1 rounded transition-colors hover:opacity-80"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-nav (desktop only) ── */}
      <div style={{ backgroundColor: 'var(--primary-dark)', borderColor: 'var(--border)' }} className="hidden md:block border-t">
        <div className="max-w-[1400px] mx-auto px-4 py-1.5 flex gap-6 overflow-x-auto scrollbar-hide">
          <Link to="/store" style={{ color: 'var(--text-muted)' }} className="text-[11px] hover:text-white uppercase tracking-widest whitespace-nowrap transition-colors">All</Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/store?category=${encodeURIComponent(cat)}`}
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] hover:text-white uppercase tracking-widest whitespace-nowrap transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
