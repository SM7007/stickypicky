import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatPrice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Delivery details form state
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);

  // Autofill if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Load Razorpay script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const deliveryCharge = subtotal >= 500 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  const handlePayment = async (e) => {
    e.preventDefault();

    // Basic Validation
    const { customerName, email, phone, address, city, state, pincode } = formData;
    if (!customerName || !email || !phone || !address || !city || !state || !pincode) {
      toast.error('All details are required');
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you connected to the internet?');
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const res = await api.post('/payments/create-order', {
        items: cartItems.map(item => ({
          productId: item.productId,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        })),
        ...formData,
      });

      const { razorpayOrderId, amount, currency, keyId, items } = res.data;

      // 3. Configure Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'stickypicky',
        description: 'Premium Poster Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: customerName,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response) {
          // Trigger backend verification
          try {
            setLoading(true);
            const verifyRes = await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cartItems.map(item => ({
                productId: item.productId,
                selectedSize: item.selectedSize,
                quantity: item.quantity,
              })),
              ...formData,
            });

            // On verification success
            toast.success('Order placed successfully!');
            clearCart();
            navigate('/payment-success', {
              state: {
                order: verifyRes.data.order,
                message: verifyRes.data.message,
              },
            });
          } catch (err) {
            console.error('Payment verification failed', err);
            toast.error(err.response?.data?.message || 'Signature verification failed.');
            navigate('/payment-failure');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
            setLoading(false);
          },
        },
      };

      // 4. Open Razorpay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Order creation failed', err);
      toast.error(err.response?.data?.message || 'Failed to initiate order.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <p className="text-secondary mb-4">No items to checkout.</p>
          <Link to="/shop" className="text-sm font-semibold uppercase text-white">Return to Shop</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold font-display text-white mb-10 uppercase tracking-wider">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Address form (Left column) */}
          <form onSubmit={handlePayment} className="lg:col-span-7 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Delivery Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Detailed Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold uppercase tracking-wider text-xs py-4 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Payment...' : 'Pay Now'}
              </button>
            </div>
          </form>

          {/* Cart review summary (Right column) */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-lg p-6 space-y-6 self-start">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>

            {/* Cart Items */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}`} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.productName} className="h-12 w-9 rounded object-cover border border-border" />
                    <div>
                      <p className="text-xs font-semibold text-white line-clamp-1">{item.productName}</p>
                      <p className="text-[10px] text-secondary">
                        Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-border" />

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
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded border border-border flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-secondary leading-relaxed">
                Payments are securely processed via Razorpay. Your card details, UPI info, and netbanking credentials are fully encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
