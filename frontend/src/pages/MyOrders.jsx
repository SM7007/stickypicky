import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { formatPrice } from '../utils/formatPrice';
import { ShoppingBag, Calendar, PackageCheck, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load user orders', err);
        setError('Could not fetch your order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-display text-primary mb-10 uppercase tracking-wider">My Orders</h1>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} retryFn={() => window.location.reload()} />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-surface shadow-sm">
            <ShoppingBag className="h-10 w-10 text-secondary mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-primary mb-1">No orders found</h3>
            <p className="text-xs text-secondary mb-6">You haven't placed any orders yet.</p>
            <a
              href="/shop"
              className="bg-primary text-background font-bold uppercase tracking-wider text-[10px] px-6 py-3 rounded hover:opacity-90 transition-colors inline-block"
            >
              Shop Posters
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
                {/* Header Summary */}
                <div className="p-4 sm:p-6 bg-background/50 border-b border-border flex flex-wrap justify-between items-center gap-4 text-xs text-secondary">
                  <div className="flex gap-6">
                    <div>
                      <span className="font-bold text-primary uppercase block mb-1">Order Placed</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-primary uppercase block mb-1">Total Paid</span>
                      <span className="text-primary font-semibold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-bold text-primary uppercase block mb-1 text-right">Order ID</span>
                      <span className="font-mono text-secondary block">{order.id}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="p-4 sm:p-6 divide-y divide-border/40">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-primary">{item.productName}</p>
                        <p className="text-xs text-secondary mt-1">
                          Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery details footer summary */}
                <div className="px-4 py-3 bg-background/30 border-t border-border/40 text-[10px] text-secondary flex justify-between">
                  <span>Shipping Address: {order.customerName}, {order.city} ({order.pincode})</span>
                  <span>Payment status: <span className="font-bold text-primary">{order.paymentStatus}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyOrders;
