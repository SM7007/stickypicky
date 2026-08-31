import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { Plus, Minus, ShoppingBag, Truck, Undo, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useSettings } from '../hooks/useSettings';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selector state
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        // Default to first size if available
        if (res.data.sizes && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0].size);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setError('Poster not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingSpinner fullPage />;
  if (error || !product) return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  // Resolve current active price and stock based on selected size
  const activeSizeData = product.sizes?.find((s) => s.size === selectedSize);
  const currentPrice = activeSizeData ? activeSizeData.price : product.price;
  const currentStock = activeSizeData ? activeSizeData.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  // Discount percentage
  const discount = product.originalPrice ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100) : 0;

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty > 0 && newQty <= currentStock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    toast.success(`${product.name} (${selectedSize || 'Default'}) added to cart`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    navigate('/checkout');
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="text-xs text-secondary mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-primary transition-colors capitalize">
            {product.category?.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">{product.name}</span>
        </nav>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left Column - Large Image Showcase */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="aspect-[3/4] w-full rounded-lg overflow-hidden border border-border bg-surface relative flex items-center justify-center shadow-sm">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800';
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Info and Config */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold bg-surface border border-border px-3 py-1 rounded-full uppercase tracking-wider text-secondary">
                {product.category?.name}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-primary mt-4 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-3 border-y border-border py-4">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-secondary line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-primary bg-surface border border-border px-2 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Sizes selector pills */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Select Size / Pack</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setQuantity(1);
                      }}
                      className={`px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                        selectedSize === s.size
                          ? 'bg-primary border-primary text-background shadow-sm'
                          : 'border-border text-secondary hover:text-primary hover:border-primary/40 bg-surface'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded bg-surface">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-3 text-secondary hover:text-primary disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-primary">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="p-3 text-secondary hover:text-primary disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                {/* Stock count label */}
                <span className="text-xs font-medium text-secondary">
                  {isOutOfStock ? (
                    <span className="text-red-500 font-semibold uppercase">Sold Out</span>
                  ) : currentStock <= 5 ? (
                    <span className="text-amber-500 font-semibold">Only {currentStock} left in stock!</span>
                  ) : (
                    <span>In Stock ({currentStock} items left)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full border border-primary text-primary font-bold uppercase tracking-wider text-sm py-4 rounded hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add To Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full bg-primary text-background font-bold uppercase tracking-wider text-sm py-4 rounded hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Buy It Now
              </button>
            </div>

            {/* Core Description Text */}
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Details</h3>
              <p className="text-sm text-secondary leading-relaxed">
                {product.description || 'Museum-quality posters made on thick and durable matte paper. Add a wonderful accent to your room and office with these posters that are sure to brighten any environment.'}
              </p>
            </div>

            {/* Selling propositions */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Truck size={14} className="text-primary" /> Free Delivery &gt; ₹{settings.freeDeliveryAbove}
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Undo size={14} className="text-primary" /> Easy 7-Day Returns
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <ShieldCheck size={14} className="text-primary" /> Secure Razorpay Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
