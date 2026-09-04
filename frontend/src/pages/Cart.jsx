import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { formatPrice } from '../utils/formatPrice';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, Truck } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const { settings } = useSettings();

  const deliveryCharge = subtotal >= settings.freeDeliveryAbove || subtotal === 0 ? 0 : settings.deliveryCharge;
  const total = subtotal + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <h2 className="text-2xl font-bold font-display text-primary mb-3">YOUR BAG IS EMPTY</h2>
          <p className="text-secondary text-sm mb-8">Once you find a poster you like, add it to your cart to start collecting.</p>
          <Link
            to="/shop"
            className="bg-primary text-background font-bold uppercase tracking-wider text-xs px-8 py-4 rounded hover:opacity-90 transition-colors inline-flex items-center gap-2"
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
        <h1 className="text-3xl font-bold font-display text-primary mb-10 uppercase tracking-wider">Your Bag</h1>

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
                  <div className="h-24 w-18 flex-shrink-0 rounded bg-background border border-border overflow-hidden">
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  </div>

                  {/* Info details */}
                  <div className="flex-grow min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm font-semibold text-primary hover:opacity-85 line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    {item.selectedSize && (
                      <span className="text-xs text-secondary mt-1 block">Size: {item.selectedSize}</span>
                    )}
                    <span className="text-sm font-medium text-primary mt-2 block">{formatPrice(item.price)}</span>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-border rounded bg-surface">
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.quantity - 1)}
                      className="p-2 text-secondary hover:text-primary cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-primary">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.quantity + 1)}
                      className="p-2 text-secondary hover:text-primary cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total price & remove button */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(item.productId, item.selectedSize)}
                      className="text-secondary hover:text-red-500 p-1 cursor-pointer"
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
              <Link to="/shop" className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-lg p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Delivery Charge</span>
                <span className="text-primary font-medium">
                  {deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}
                </span>
              </div>
              {settings.freeDeliveryAbove > 0 && (
                <div className="mt-1 space-y-2">
                  {deliveryCharge === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-semibold">
                      <Truck size={13} />
                      <span>🎉 You've unlocked FREE delivery!</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold">
                          <Truck size={11} />
                          Add {formatPrice(settings.freeDeliveryAbove - subtotal)} more for FREE delivery
                        </span>
                        <span className="text-[10px] text-secondary">
                          {Math.round((subtotal / settings.freeDeliveryAbove) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((subtotal / settings.freeDeliveryAbove) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold text-primary">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-primary text-background font-bold uppercase tracking-wider text-xs py-4 rounded hover:opacity-90 transition-colors flex items-center justify-center gap-2"
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
