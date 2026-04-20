import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { getImageUrl, PLACEHOLDER_IMG } from '../utils/imageUrl';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-10 bg-surface mt-6 border border-border">
        <h1 className="text-xl font-semibold mb-2 text-textMain">Cart is empty</h1>
        <p className="text-textMuted text-sm mb-4">Add items from the store.</p>
        <Link to="/store" className="text-secondary text-sm uppercase tracking-widest hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.product?.price ?? 0) * item.quantity,
    0
  );
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-grow bg-surface p-6 border border-border">
        <h1 className="text-xl font-semibold mb-1 text-textMain uppercase tracking-tight">Cart</h1>
        <div className="text-right text-textMuted text-xs uppercase tracking-wider pb-2 border-b border-border">Unit price</div>

        {cart.items.map((item) => {
          const imageUrl = getImageUrl(item.product?.image);
          return (
            <div key={item._id} className="py-4 border-b border-border flex gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 border border-border bg-gray-50 p-1.5 rounded-md flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={item.product?.name || 'Product'}
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-semibold text-textDark line-clamp-2 leading-tight">{item.product?.name || 'Unavailable product'}</h3>
                <p className="text-xs text-textMuted mt-1">
                  {item.product?.stock > 0 ? '✓ In stock' : '✗ Unavailable'}
                </p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value, 10))}
                    className="border border-border bg-surface px-2 py-1.5 text-sm text-textMain outline-none focus:border-secondary rounded-md"
                  >
                    {[...Array(Math.max(1, Math.min(10, item.product?.stock ?? 1))).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>Qty {x + 1}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-sm font-bold text-right shrink-0 text-textDark whitespace-nowrap">
                ${Number(item.product?.price ?? 0).toFixed(2)}
              </div>
            </div>
          );
        })}

        <div className="text-right text-sm mt-4 text-textMuted">
          Subtotal <span className="font-mono text-textMain font-semibold">{totalItems}</span> items:{' '}
          <span className="font-mono text-textMain">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="w-full lg:w-[280px] shrink-0">
        <div className="bg-surface p-6 border border-border sticky top-4">
          <div className="text-sm mb-4 text-textMuted">
            Subtotal <span className="font-mono text-textMain">({totalItems})</span>
            <div className="text-xl font-mono font-semibold text-textMain mt-1">${subtotal.toFixed(2)}</div>
          </div>
          <button type="button" onClick={() => navigate('/checkout')} className="btn-primary w-full py-2 text-xs uppercase tracking-widest">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
