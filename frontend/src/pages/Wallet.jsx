import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const usedCoupons = coupons.filter(c => c.isUsed);
  const freeCouponsCount = coupons.filter(
    c => c.code.startsWith('FREE-') && !c.isUsed
  ).length;

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons/my');
      setCoupons(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const generateFreeCoupon = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/coupons/free-test');
      toast.success(`Free test coupon created: ${data.data.code}`);
      await fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create test coupon');
    } finally {
      setCreating(false);
    }
  };

  const activeCoupons = coupons.filter((c) => !c.isUsed);

  if (loading) {
    return <div className="p-12 text-center text-textMuted text-xs uppercase tracking-widest">Wallet…</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <div className="card p-8">
        <h1 className="text-2xl font-black mb-2">My Coupon Wallet</h1>
        <p className="text-textMuted mb-6">Use these coupons at checkout only.</p>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-xs uppercase tracking-wider"
            onClick={generateFreeCoupon}
            disabled={creating || freeCouponsCount >= 3} // ✅ FIX
          >
            {creating
              ? 'Creating…'
              : freeCouponsCount >= 3
                ? 'Limit Reached (3/3)' // ✅ FIX
                : 'Get First 3 coupons For Free'}
          </button>
        </div>

        <div className="mb-6 border border-border p-4 bg-backgroundElevated">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-3">Active Coupon Codes</h2>
          {activeCoupons.length === 0 ? (
            <div className="text-sm text-textMuted">No active coupons.</div>
          ) : (
            <div className="space-y-2">
              {activeCoupons.map((coupon) => (
                <div key={coupon._id} className="flex items-center justify-between border border-border p-2">
                  <span className="font-mono text-secondary">{coupon.code}</span>
                  <span className="text-xs text-emerald-400 font-bold">{coupon.discount}% OFF</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {usedCoupons.length > 0 && (
          <div className="space-y-3">
            {usedCoupons.map((coupon) => (
              <div key={coupon._id} className="border border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-secondary">{coupon.code}</div>
                  <div className="text-sm text-textMain">Discount: {coupon.discount}%</div>
                </div>
                <div className="text-xs uppercase tracking-wider font-bold text-red-400">
                  Used{coupon.usedAt ? ` • ${new Date(coupon.usedAt).toLocaleString()}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

