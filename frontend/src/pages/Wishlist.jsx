import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.data.products || []);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlist((prev) => prev.filter((p) => p._id.toString() !== id.toString()));
      toast.success('Removed');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-textMuted text-xs uppercase tracking-widest">Loading…</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-6 border-b border-border pb-2">Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="bg-surface p-6 border border-border text-sm text-textMuted">
          <p className="mb-3">Empty.</p>
          <Link to="/store" className="text-secondary text-xs uppercase tracking-widest hover:underline">
            Browse store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                className="absolute top-2 right-2 bg-surface text-red-400 border border-border w-8 h-8 text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:border-red-400"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
