import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingBag, Search, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search / filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/orders/admin/all?status=${statusFilter}` : '/orders/admin/all';
      const res = await api.get(url);
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError('Could not fetch orders list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { orderStatus: newStatus });
      toast.success('Order status updated');
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Could not update order status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.phone.includes(searchQuery)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'CANCELLED': return 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10';
      case 'SHIPPED': return 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10';
    }
  };

  if (loading && orders.length === 0) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} retryFn={fetchOrders} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Orders Manager</h1>
          <p className="text-xs text-secondary mt-1">Track payments, shipping statuses and order histories</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-primary border border-border rounded pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface text-secondary hover:text-primary border border-border rounded px-3 py-2 text-xs focus:outline-none focus:border-primary w-full sm:w-auto cursor-pointer"
          >
            <option value="" className="bg-surface text-primary">All Statuses</option>
            <option value="PENDING" className="bg-surface text-primary">Pending</option>
            <option value="CONFIRMED" className="bg-surface text-primary">Confirmed</option>
            <option value="PROCESSING" className="bg-surface text-primary">Processing</option>
            <option value="SHIPPED" className="bg-surface text-primary">Shipped</option>
            <option value="DELIVERED" className="bg-surface text-primary">Delivered</option>
            <option value="CANCELLED" className="bg-surface text-primary">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-surface">
            <p className="text-secondary text-sm">No orders matching the criteria.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-surface border border-border rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    <th className="p-4 pl-6">Order ID</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4">Update Status</th>
                    <th className="p-4 pr-6 text-right font-semibold">View</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-border/40">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-background/40 transition-colors">
                      {/* ID & Date */}
                      <td className="p-4 pl-6 font-mono text-primary">
                        {order.id}
                        <span className="text-[9px] text-secondary block font-sans mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <span className="font-semibold text-primary block">{order.customerName}</span>
                        <span className="text-secondary block mt-0.5">{order.phone}</span>
                      </td>

                      {/* Payment Status */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Total paid */}
                      <td className="p-4">
                        <span className="font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
                      </td>

                      {/* Order Status Display */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase inline-block ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Update Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-background text-secondary hover:text-primary border border-border rounded px-2 py-1 focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="PENDING" className="bg-surface text-primary">Pending</option>
                          <option value="CONFIRMED" className="bg-surface text-primary">Confirmed</option>
                          <option value="PROCESSING" className="bg-surface text-primary">Processing</option>
                          <option value="SHIPPED" className="bg-surface text-primary">Shipped</option>
                          <option value="DELIVERED" className="bg-surface text-primary">Delivered</option>
                          <option value="CANCELLED" className="bg-surface text-primary">Cancelled</option>
                        </select>
                      </td>

                      {/* Action View */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-secondary hover:text-primary cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-surface border border-border rounded-lg p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-secondary font-mono block">Order ID</span>
                      <span className="font-mono text-xs text-primary">{order.id}</span>
                      <span className="text-[9px] text-secondary block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-background border border-border rounded hover:bg-surface text-primary cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div className="border-t border-border/40 pt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-secondary text-[10px] block">Customer</span>
                      <span className="font-semibold text-primary block">{order.customerName}</span>
                      <span className="text-secondary text-[10px] block mt-0.5">{order.phone}</span>
                    </div>
                    <div>
                      <span className="text-secondary text-[10px] block">Amount</span>
                      <span className="font-semibold text-primary block">{formatPrice(order.totalAmount)}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-2 flex flex-col xs:flex-row gap-2 justify-between items-start xs:items-center">
                    <div>
                      <span className="text-secondary text-[10px] block mb-1">Status</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase inline-block ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="w-full xs:w-auto">
                      <span className="text-secondary text-[10px] block mb-1">Update Status</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full xs:w-auto bg-background text-secondary hover:text-primary border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="PENDING" className="bg-surface text-primary">Pending</option>
                        <option value="CONFIRMED" className="bg-surface text-primary">Confirmed</option>
                        <option value="PROCESSING" className="bg-surface text-primary">Processing</option>
                        <option value="SHIPPED" className="bg-surface text-primary">Shipped</option>
                        <option value="DELIVERED" className="bg-surface text-primary">Delivered</option>
                        <option value="CANCELLED" className="bg-surface text-primary">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Order Invoice details</h3>
                <span className="text-[10px] text-secondary font-mono mt-1 block">ID: {selectedOrder.id}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-secondary hover:text-primary text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Address fields */}
            <div className="text-xs text-secondary space-y-1 bg-background/50 p-4 border border-border rounded">
              <span className="font-bold text-primary uppercase tracking-wider block mb-2">Delivery Address</span>
              <p className="font-medium text-primary">{selectedOrder.customerName}</p>
              <p>{selectedOrder.address}</p>
              <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
              <p>Phone: {selectedOrder.phone}</p>
              <p>Email: {selectedOrder.email}</p>
            </div>

            {/* Ordered Items list */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-primary tracking-wider block">Ordered Posters</span>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs items-center">
                  <span className="text-secondary">
                    {item.productName} {item.selectedSize ? `(${item.selectedSize})` : ''}{' '}
                    <span className="text-primary font-medium">x{item.quantity}</span>
                  </span>
                  <span className="text-primary font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-border/50" />

            {/* Status updates inside modal */}
            <div className="flex justify-between items-center gap-4 text-xs">
              <div>
                <span className="text-secondary block mb-1">Update Shipment status:</span>
                 <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="bg-background text-primary border border-border rounded px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="PENDING" className="bg-surface text-primary">Pending</option>
                  <option value="CONFIRMED" className="bg-surface text-primary">Confirmed</option>
                  <option value="PROCESSING" className="bg-surface text-primary">Processing</option>
                  <option value="SHIPPED" className="bg-surface text-primary">Shipped</option>
                  <option value="DELIVERED" className="bg-surface text-primary">Delivered</option>
                  <option value="CANCELLED" className="bg-surface text-primary">Cancelled</option>
                </select>
              </div>
              <div className="text-right">
                <span className="text-secondary block">Total Paid:</span>
                <span className="text-sm font-bold text-primary block mt-0.5">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
