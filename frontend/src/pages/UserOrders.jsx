import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';

const PLACEHOLDER = 'https://placehold.co/120x120/1a1a1a/737373?text=—';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data.data);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-textMuted text-xs uppercase tracking-widest">Loading orders…</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-6 border-b border-border pb-2">Your orders</h1>

      {orders.length === 0 ? (
        <div className="bg-surface p-6 border border-border text-sm text-textMuted">No orders yet.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border border-border bg-surface overflow-hidden">
              <div className="bg-backgroundElevated p-4 border-b border-border flex flex-wrap justify-between gap-4 text-xs uppercase tracking-wider text-textMuted">
                <div>
                  <div className="mb-1">Placed</div>
                  <div className="text-textMain font-mono normal-case">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="mb-1">Total</div>
                  <div className="text-textMain font-mono normal-case">${order.totalPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="mb-1">Status</div>
                  <div className={`font-semibold normal-case ${order.status === 'Delivered' ? 'text-secondary' : 'text-textMain'}`}>
                    {order.status}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mb-1">Id</div>
                  <div className="text-textMain font-mono normal-case text-[11px] truncate max-w-[200px]">{order._id}</div>
                </div>
              </div>

              <div className="p-4">
                {order.orderItems.map((item, index) => {
                  const imageUrl = getImageUrl(item.image);
                  return (
                    <div key={index} className="flex gap-4 mb-4 last:mb-0 border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="w-20 h-20 shrink-0 border border-border bg-backgroundElevated p-1">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER;
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-textMain text-sm">{item.name}</h4>
                        <div className="text-xs text-textMuted mt-1 font-mono">Qty {item.quantity}</div>
                        <div className="text-sm font-mono text-textMain mt-1">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
