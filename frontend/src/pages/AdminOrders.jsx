import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-textMuted text-xs uppercase tracking-widest">Loading…</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-6 border-b border-border pb-2">Orders</h1>

      <div className="card overflow-x-auto border-border">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-textMuted uppercase bg-backgroundElevated border-b border-border">
            <tr>
              <th className="px-6 py-4">Order ID / Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b border-border hover:bg-backgroundElevated">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs">{order._id}</div>
                  <div className="text-textMuted mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{order.user?.name || 'Unknown'}</div>
                  <div className="text-textMuted">{order.user?.email}</div>
                </td>
                <td className="px-6 py-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 border text-xs font-mono ${
                      order.status === 'Delivered'
                        ? 'border-secondary text-secondary'
                        : order.status === 'Cancelled'
                          ? 'border-red-400 text-red-400'
                          : 'border-border text-textMuted'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={order.status === 'Cancelled'}
                    className="border border-border px-2 py-1 outline-none text-sm bg-surface text-textMain"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
