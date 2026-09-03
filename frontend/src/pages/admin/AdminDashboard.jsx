import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingBag, CreditCard, FolderOpen, ClipboardList } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
        setError('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (error || !stats) return <AdminLayout><ErrorMessage message={error} /></AdminLayout>;

  const statCards = [
    { name: 'Total Sales / Revenue', value: formatPrice(stats.totalRevenue), icon: CreditCard, color: 'text-emerald-500 font-bold' },
    { name: 'Total Products Active', value: stats.totalProducts, icon: ShoppingBag, color: 'text-blue-500 font-bold' },
    { name: 'Total Orders Placed', value: stats.totalOrders, icon: FolderOpen, color: 'text-primary' },
    { name: 'Pending Orders', value: stats.pendingOrders, icon: ClipboardList, color: 'text-amber-500 font-bold' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Dashboard Overview</h1>
          <p className="text-xs text-secondary mt-1">Real-time statistics of your stickypicky storefront</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{card.name}</span>
                  <Icon size={18} className={card.color} />
                </div>
                <p className="text-2xl font-bold text-primary tracking-tight">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Admin Instructions Section */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Store Management Instructions</h3>
          <ul className="text-xs text-secondary space-y-2 list-disc list-inside leading-relaxed">
            <li>Go to <a href="/admin/products" className="text-primary hover:underline font-semibold">Products</a> to add, edit or delete posters and manage stocks.</li>
            <li>Go to <a href="/admin/categories" className="text-primary hover:underline font-semibold">Categories</a> to add, edit or remove store categories (e.g. Polaroids, Anime, Stickers).</li>
            <li>Go to <a href="/admin/orders" className="text-white hover:underline font-semibold">Orders</a> to view details of customer purchases and confirm/ship products.</li>
            <li>Go to <a href="/admin/settings" className="text-primary hover:underline font-semibold">Delivery Settings</a> to configure delivery charges and free delivery threshold.</li>
            <li>Prices configured inside product size variants are matched dynamically during Razorpay verification checks.</li>
            <li>Images uploaded are hosted instantly in Cloudinary.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
