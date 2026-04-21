import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, cartLoading, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (!user) return;
    setAddress({
      address: user.address?.street || '',
      city: user.address?.city || '',
      postalCode: user.address?.zipCode || '',
      country: user.address?.country || '',
    });
  }, [user]);

  useEffect(() => {
    if (cartLoading) return;
    if (!cart?.items?.length) {
      navigate('/cart', { replace: true });
    }
  }, [cartLoading, cart, navigate]);

  if (cartLoading) {
    return <div className="p-12 text-center text-textMuted text-xs uppercase tracking-widest">Checkout…</div>;
  }

  if (!cart?.items?.length) {
    return <div className="p-12 text-center text-textMuted text-xs uppercase tracking-widest">Redirecting…</div>;
  }

  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);
  const computedDiscount = appliedCoupon ? discountAmount : subtotal * discount;
  const total = Math.max(0, subtotal - computedDiscount);

  const applyCoupon = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/coupons/apply', { code: couponCode, subtotal });
      const result = data.data;
      setAppliedCoupon(result.code);
      setDiscount(result.discount / 100);
      setDiscountAmount(result.discountAmount);
      toast.success(`${result.discount}% coupon applied`);
    } catch (error) {
      setAppliedCoupon(null);
      setDiscount(0);
      setDiscountAmount(0);
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', { shippingAddress: address, couponCode: appliedCoupon || '' });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate('/my-orders', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="bg-surface p-6 border border-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-6 border-b border-border pb-2">Shipping</h2>
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Street</label>
              <input required type="text" className="input-field" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">City</label>
                <input required type="text" className="input-field" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Postal</label>
                <input required type="text" className="input-field" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1">Country</label>
              <input required type="text" className="input-field" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-2">Payment</h3>
              <div className="flex items-center gap-2 text-sm text-textMain">
                <input type="radio" checked readOnly id="cod" className="w-4 h-4 accent-secondary" />
                <label htmlFor="cod">Cash on delivery</label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="w-full md:w-[350px] shrink-0">
        <div className="bg-surface p-6 border border-border">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-4 border-b border-border pb-2">Summary</h3>
          <div className="flex justify-between mb-2 text-sm text-textMuted font-mono">
            <span>Items</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between mb-2 text-sm text-secondary font-mono">
              <span>Discount</span>
              <span>-${computedDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between mb-4 text-sm text-textMuted pb-4 border-b border-border font-mono">
            <span>Shipping</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between mt-4 text-lg font-mono font-semibold text-textMain mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="mb-6 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-2">Promo</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter your wallet coupon"
                className="input-field py-2 flex-1 min-w-0 text-sm"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button type="button" onClick={applyCoupon} className="btn-secondary px-4 py-2 text-xs uppercase tracking-wider shrink-0">
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-secondary mt-2">Applied: {appliedCoupon}</p>
            )}
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? '…' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
