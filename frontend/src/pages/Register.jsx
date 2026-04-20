import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password });
      toast.success('Account created! Welcome aboard.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black" style={{ color: 'var(--text-main)' }}>
            <ShoppingBag className="shrink-0" size={32} style={{ color: 'var(--secondary)' }} />
            Shop<span style={{ color: 'var(--secondary)' }}>Brand</span>
          </Link>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Create your free account</p>
        </div>

        <div className="p-8 shadow-lg" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderWidth: '1px' }}>
          <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-dark)' }}>Get started</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>Full Name</label>
              <input
                id="register-name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>Email Address</label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength hint */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 transition-colors"
                      style={{
                        backgroundColor: password.length >= level * 4
                          ? level === 3 ? '#22c55e' : level === 2 ? '#eab308' : '#f97316'
                          : theme === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: '2px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base font-bold"
              disabled={loading}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            By creating an account you agree to our{' '}
            <Link to="#" className="transition-colors" style={{ color: 'var(--secondary)' }}>Terms of Service</Link>.
          </p>

          <div className="pt-6 text-center" style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold transition-colors" style={{ color: 'var(--secondary)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
