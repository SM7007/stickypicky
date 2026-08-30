import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { id, name, slug, price, originalPrice, image, stock } = product;

  // Calculate discount percentage
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isOutOfStock = stock <= 0;

  const handleAddClick = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, null, 1);
    toast.success(`${name} added to cart`);
  };

  return (
    <Link to={`/products/${slug}`} className="group block bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-white/30 hover:scale-[1.01] flex flex-col h-full relative">
      {/* Sale/Out of stock badge */}
      {isOutOfStock ? (
        <span className="absolute top-3 left-3 bg-[#222222] text-[#888888] text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase z-10 border border-border">
          Sold Out
        </span>
      ) : discount > 0 ? (
        <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase z-10">
          -{discount}% OFF
        </span>
      ) : null}

      {/* Product Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 border-b border-border flex items-center justify-center">
        <img
          src={image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800'; // fallback
          }}
        />
        
        {/* Hover overlay button (hidden on touch devices via class, always present/visible as icon button on mobile) */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden sm:flex">
            <button
              onClick={handleAddClick}
              className="bg-white text-black font-semibold text-xs tracking-wider uppercase py-2.5 px-5 rounded shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 hover:bg-zinc-200"
            >
              <ShoppingCart size={14} /> Add To Cart
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider mb-1">
          {product.category?.name || 'Poster'}
        </span>
        <h3 className="text-sm font-semibold text-white group-hover:text-glow leading-snug line-clamp-2 mb-2 flex-grow">
          {name}
        </h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-sm font-bold text-white">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-xs text-secondary line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Action Button for mobile / fallback */}
        <button
          onClick={handleAddClick}
          disabled={isOutOfStock}
          className={`w-full py-2 border rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:hidden ${
            isOutOfStock
              ? 'border-border text-secondary cursor-not-allowed bg-transparent'
              : 'border-white text-white hover:bg-white hover:text-black transition-colors duration-200 bg-transparent'
          }`}
        >
          {isOutOfStock ? 'Sold Out' : (
            <>
              <ShoppingCart size={13} /> Add
            </>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
