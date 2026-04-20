import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/orders/stats/dashboard');
        setStats(data.data);
      } catch (error) {
        setStats({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-textMuted text-xs uppercase tracking-widest">Loading…</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-8 border-b border-border pb-2">Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="card p-6 border-l-2 border-l-secondary">
          <h3 className="text-textMuted text-xs uppercase tracking-widest mb-2">Revenue</h3>
          <div className="text-2xl font-mono font-semibold text-textMain">${stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="card p-6 border-l-2 border-l-border">
          <h3 className="text-textMuted text-xs uppercase tracking-widest mb-2">Orders</h3>
          <div className="text-2xl font-mono font-semibold text-textMain">{stats.totalOrders}</div>
        </div>
        <div className="card p-6 border-l-2 border-l-border">
          <h3 className="text-textMuted text-xs uppercase tracking-widest mb-2">Products</h3>
          <div className="text-2xl font-mono font-semibold text-textMain">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="card p-8 flex flex-col border-border hover:border-secondary transition-colors"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-textMain mb-2">Products</h2>
          <p className="text-textMuted text-sm leading-relaxed">Catalog CRUD, image from product name slug.</p>
        </Link>

        <Link
          to="/admin/orders"
          className="card p-8 flex flex-col border-border hover:border-secondary transition-colors"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-textMain mb-2">Orders</h2>
          <p className="text-textMuted text-sm leading-relaxed">Fulfillment queue and status updates.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
