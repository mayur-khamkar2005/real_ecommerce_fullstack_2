import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getImageUrl, PLACEHOLDER_IMG } from '../utils/imageUrl';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ]);
        setProduct(productRes.data.data);
        setReviews(reviewsRes.data.data);

        // Increment view (debounced, localStorage prevention)
        const viewKey = `viewed_product_${id}`;
        const now = Date.now();
        const lastViewed = localStorage.getItem(viewKey);
        if (!lastViewed || (now - parseInt(lastViewed, 10)) > 30 * 60 * 1000) {
          localStorage.setItem(viewKey, now.toString());
          api.post(`/products/${id}/view`).catch(() => {});
        }
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/wishlist/${product._id}`);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review added successfully');
      setReviewForm({ rating: 5, comment: '' });
      const reviewsRes = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-textMuted text-sm uppercase tracking-widest">Loading…</div>;
  }
  if (!product) {
    return <div className="p-12 text-center text-textMuted">Product not found</div>;
  }

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 bg-surface p-6 md:p-8 border border-border">
        <div className="flex justify-center items-center bg-backgroundElevated p-6 border border-border min-h-[280px]">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full max-w-md max-h-[500px] object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMG;
            }}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-semibold text-textMain mb-2 tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4 text-sm text-textMuted">
            <span className="flex items-center text-secondary">
              <Star size={16} fill="currentColor" />
              <span className="ml-1 text-textMain font-mono">{product.rating?.toFixed(1) || '0.0'}</span>
            </span>
            <span className="font-mono">({product.numReviews || 0})</span>
            {product.views > 0 && (
              <span className="ml-2 text-xs text-textMuted">| {product.views} views</span>
            )}
            {product.purchaseCount > 0 && (
              <span className="text-xs text-textMuted">| {product.purchaseCount} sold</span>
            )}
          </div>

          <hr className="border-border my-4" />

          <div className="text-2xl font-mono font-semibold text-textMain mb-2">
            ${Number(product.price ?? 0).toFixed(2)}
          </div>

          <div className="text-sm mb-6">
            <span className="text-textMuted uppercase tracking-wider text-xs mr-2">Stock</span>
            {product.stock > 0 ? (
              <span className="text-secondary font-medium">{product.stock} available</span>
            ) : (
              <span className="text-red-400 font-medium">Out of stock</span>
            )}
          </div>

          <p className="text-textMuted mb-8 leading-relaxed text-sm">{product.description}</p>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            {product.stock > 0 && (
              <div className="flex items-center gap-3 flex-1">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="border border-border bg-surface px-3 py-2 outline-none w-20 text-sm text-textMain"
                >
                  {[...Array(Math.min(10, product.stock)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleAddToCart} className="btn-primary flex items-center justify-center gap-2 flex-1 px-6">
                  <ShoppingCart size={18} strokeWidth={1.75} /> Add to cart
                </button>
              </div>
            )}
            <button type="button" onClick={handleAddToWishlist} className="btn-secondary flex items-center justify-center gap-2 px-6">
              <Heart size={18} strokeWidth={1.75} /> Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-surface p-6 md:p-8 border border-border">
        <h2 className="text-lg font-semibold mb-6 text-textMain border-b border-border pb-2 uppercase tracking-widest text-xs">
          Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-textMuted uppercase tracking-wider">Write a review</h3>
            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Rating</label>
                  <select
                    value={String(reviewForm.rating)}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="input-field"
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Comment</label>
                  <textarea
                    required
                    rows="4"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-secondary w-full uppercase tracking-widest text-xs">
                  Submit
                </button>
              </form>
            ) : (
              <p className="text-sm text-textMuted">
                <Link to="/login" className="text-secondary hover:underline">
                  Sign in
                </Link>{' '}
                to review.
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-textMuted text-sm">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="font-medium text-textMain">{review.user?.name || 'User'}</div>
                    <div className="flex text-secondary">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs ml-1 font-mono text-textMain">{review.rating}</span>
                    </div>
                    <div className="text-xs text-textMuted ml-auto font-mono">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-textMuted">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
