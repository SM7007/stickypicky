import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <h2 className="text-2xl font-bold font-display text-white mb-3">YOUR BAG IS EMPTY</h2>
          <p className="text-secondary text-sm mb-8">Once you find a poster you like, add it to your cart to start collecting.</p>
          <Link
            to="/shop"
            className="bg-white text-black font-bold uppercase tracking-wider text-xs px-8 py-4 rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold font-display text-white mb-10 uppercase tracking-wider">Your Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border-t border-border">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedSize || 'default'}`}
                  className="flex items-center py-6 border-b border-border gap-4 sm:gap-6"
                >
                  {/* Image */}
                  <div className="h-24 w-18 flex-shrink-0 rounded bg-zinc-900 border border-border overflow-hidden">
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  </div>

                  {/* Info details */}
                  <div className="flex-grow min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm font-semibold text-white hover:text-glow line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    {item.selectedSize && (
                      <span className="text-xs text-secondary mt-1 block">Size: {item.selectedSize}</span>
                    )}
                    <span className="text-sm font-medium text-white mt-2 block">{formatPrice(item.price)}</span>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-border rounded bg-surface">
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.quantity - 1)}
                      className="p-2 text-secondary hover:text-white"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.quantity + 1)}
                      className="p-2 text-secondary hover:text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total price & remove button */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(item.productId, item.selectedSize)}
                      className="text-secondary hover:text-red-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4">
              <Link to="/shop" className="text-sm text-secondary hover:text-white inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-lg p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Delivery Charge</span>
                <span className="text-white font-medium">
                  {deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-[10px] text-amber-500 font-medium">
                  Add {formatPrice(500 - subtotal)} more for free delivery.
                </p>
              )}
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-white text-black font-bold uppercase tracking-wider text-xs py-4 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
