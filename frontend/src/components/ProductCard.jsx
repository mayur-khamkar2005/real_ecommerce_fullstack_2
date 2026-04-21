import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Star } from 'lucide-react';
import { PLACEHOLDER_IMG } from '../utils/imageUrl';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ IMPORTANT FIX (no processing)
  const imageUrl = product?.image;

  return (
    <div
      className="card flex flex-col group h-full transition-all duration-300 hover:-translate-y-1"
      style={{ '--card-shadow': '0 8px 24px rgba(0,0,0,0.12)' }}
    >
      {/* IMAGE */}
      <Link
        to={`/product/${product._id}`}
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        className="h-56 p-5 relative overflow-hidden flex items-center justify-center border-b"
      >
        {/* Skeleton */}
        {!imageLoaded && (
          <div
            style={{ backgroundColor: 'var(--border)' }}
            className="absolute inset-0 animate-pulse pointer-events-none"
          />
        )}

        <img
          src={imageUrl || PLACEHOLDER_IMG}
          alt={product?.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMG;
            setImageLoaded(true);
          }}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
            !imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </Link>

      {/* CONTENT */}
      <div
        style={{ backgroundColor: 'var(--surface)' }}
        className="p-5 flex flex-col flex-grow"
      >
        {/* NAME */}
        <Link
          to={`/product/${product._id}`}
          style={{ color: 'var(--text-dark)' }}
          className="font-semibold line-clamp-2 hover:text-secondary transition-colors mb-2 leading-tight text-sm"
        >
          {product?.name}
        </Link>

        {/* RATING */}
        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="flex items-center" style={{ color: 'var(--secondary)' }}>
            <Star size={13} fill="currentColor" />
            <span
              className="ml-1 font-bold"
              style={{ color: 'var(--text-main)' }}
            >
              {product?.rating?.toFixed(1) || '0.0'}
            </span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            ({product?.numReviews || 0})
          </span>
        </div>

        {/* PRICE */}
        <div
          className="text-lg font-black mt-auto mb-4"
          style={{ color: 'var(--text-main)' }}
        >
          ${Number(product?.price ?? 0).toFixed(2)}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => addToCart(product._id, 1)}
          disabled={product?.stock <= 0}
          className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wider"
        >
          {product?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;