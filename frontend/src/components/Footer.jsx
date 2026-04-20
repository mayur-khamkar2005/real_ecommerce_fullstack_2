import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--text-muted)' }} className="border-t mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-10">
          <div>
            <h3 style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} className="text-xs font-semibold uppercase tracking-widest mb-4 border-b pb-2">
              About
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Minimal storefront demo — structured layout, sharp typography, and a dark developer-first palette.
            </p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={16} style={{ color: 'var(--secondary)' }} className="shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>Remote / distributed</span>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} className="text-xs font-semibold uppercase tracking-widest mb-4 border-b pb-2">
              Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/store" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/wishlist" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} className="text-xs font-semibold uppercase tracking-widest mb-4 border-b pb-2">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} style={{ color: 'var(--secondary)' }} className="shrink-0" strokeWidth={1.5} />
                <a href="mailto:hello@devmart.local" style={{ color: 'inherit' }} className="hover:text-secondary transition-colors">
                  hello@devmart.local
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} className="text-xs font-semibold uppercase tracking-widest mb-4 border-b pb-2">
              Colophon
            </h3>
            <p className="text-sm leading-relaxed mb-4">Delivering quality products with seamless shopping experience.</p>
            <div className="flex gap-2">
              <span style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} className="w-9 h-9 border flex items-center justify-center text-[10px] font-mono">
                gh
              </span>
              <span style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} className="w-9 h-9 border flex items-center justify-center text-[10px] font-mono">
                in
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderColor: 'var(--border)' }} className="border-t pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} DevMart</p>
          <div className="flex gap-6">
            <span className="hover:text-text-main cursor-default">Privacy</span>
            <span className="hover:text-text-main cursor-default">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
