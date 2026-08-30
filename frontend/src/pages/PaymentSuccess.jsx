import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { formatPrice } from '../utils/formatPrice';
import { CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.order) {
    return <Navigate to="/" replace />;
  }

  const { order } = state;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-white mx-auto mb-6 text-glow animate-bounce" />
        
        <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">Thank you for your order</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white uppercase tracking-wider mb-6">
          Order placed successfully!
        </h1>
        
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 text-left space-y-6 max-w-xl mx-auto">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Order ID</span>
              <p className="text-sm font-bold text-white mt-1">{order.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Payment Status</span>
              <p className="text-xs font-bold bg-white text-black px-2 py-0.5 rounded uppercase mt-1 inline-block">
                {order.paymentStatus}
              </p>
            </div>
          </div>

          {/* Purchased products summary */}
          <div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-3">Purchased Posters</span>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-secondary">
                    {item.productName} {item.selectedSize ? `(${item.selectedSize})` : ''}{' '}
                    <span className="text-white font-medium">x{item.quantity}</span>
                  </span>
                  <span className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-secondary">
              <span>Delivery Charge</span>
              <span className="text-white">
                {order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-border/10">
              <span>Total Paid</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="pt-4 border-t border-border text-xs text-secondary space-y-1">
            <span className="font-bold text-white uppercase tracking-wider block mb-2">Shipping to:</span>
            <p className="font-medium text-white">{order.customerName}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p>Phone: {order.phone}</p>
          </div>
        </div>

        <div className="pt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="bg-white text-black font-bold uppercase tracking-wider text-xs px-8 py-4 rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="border border-white/20 text-white font-semibold uppercase tracking-wider text-xs px-8 py-4 rounded hover:bg-white/5 transition-colors"
          >
            View Order History
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
