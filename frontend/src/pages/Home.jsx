import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import ProductGrid from '../components/product/ProductGrid';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useSettings } from '../hooks/useSettings';

const Home = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?limit=4');
        const featured = res.data.products.filter(p => p.featured) || res.data.products.slice(0, 4);
        setProducts(featured.length > 0 ? featured : res.data.products.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured products', err);
        setError('Could not load featured posters');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Anime', slug: 'anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600' },
    { name: 'Stickers', slug: 'stickers', image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600' },
    { name: 'Polaroids', slug: 'polaroids', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600' },
    { name: 'Bollywood', slug: 'bollywood', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600' },
    { name: 'Aesthetic', slug: 'aesthetic', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-surface to-background overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-16">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full text-xs font-semibold tracking-wider text-primary">
              <Sparkles size={12} className="text-glow" /> FRESH POSTERS & STICKERS LIVE NOW
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] font-display text-primary">
              WALLS & TECH <br />
              <span className="text-glow font-light italic">THAT SPEAK LOUDER</span>
            </h1>
            <p className="text-secondary text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Premium physical posters & waterproof vinyl stickers. Exclusively conceptualized, designed, and printed on museum-grade materials. Delivered across India.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-primary text-background font-bold uppercase tracking-wider text-sm px-8 py-4 rounded hover:opacity-90 transition-colors duration-200 flex items-center gap-2"
              >
                Shop All <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop?category=stickers"
                className="border border-border text-primary font-semibold uppercase tracking-wider text-sm px-8 py-4 rounded hover:bg-surface transition-colors duration-200"
              >
                Stickers
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Visual poster mockup pile */}
            <div className="relative w-72 sm:w-80 aspect-[3/4]">
              {/* Card 3 */}
              <div className="absolute inset-0 bg-surface rounded-lg border border-border overflow-hidden rotate-6 translate-x-12 translate-y-6 shadow-2xl scale-95 opacity-40">
                <img src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600" className="w-full h-full object-cover" alt="Anime Art" />
              </div>
              {/* Card 2 */}
              <div className="absolute inset-0 bg-surface rounded-lg border border-border overflow-hidden -rotate-6 -translate-x-8 translate-y-2 shadow-2xl scale-95 opacity-60">
                <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600" className="w-full h-full object-cover" alt="Movie Poster" />
              </div>
              {/* Card 1 (Top) */}
              <div className="absolute inset-0 bg-surface rounded-lg border border-border overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-105">
                <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600" className="w-full h-full object-cover" alt="Featured Poster" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-surface border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 px-4">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Free & Fast Shipping</h4>
                <p className="text-xs text-secondary mt-1">Free delivery all over India for orders above ₹{settings.freeDeliveryAbove}.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 border-y md:border-y-0 md:border-x border-border py-6 md:py-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Premium Quality Guaranteed</h4>
                <p className="text-xs text-secondary mt-1"> museum-grade print quality.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 px-4">
              <Heart className="h-6 w-6 text-primary" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Loved by Collectors</h4>
                <p className="text-xs text-secondary mt-1">Rated 4.9+ stars by over 10,000 customers across India.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">CURATED PICKS</span>
            <h2 className="text-3xl font-bold font-display text-primary">FEATURED DROPS</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </section>

      {/* Popular Categories */}
      <section className="bg-surface/50 border-t border-border py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">EXPLORE CATEGORIES</span>
            <h2 className="text-3xl font-bold font-display text-primary">POPULAR CORNERS</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-lg overflow-hidden border border-border bg-surface"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 z-10"></div>
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 p-4 text-center">
                  <h3 className="text-lg sm:text-xl font-bold tracking-wider uppercase text-white group-hover:scale-105 transition-transform">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Promotional Section */}
      <section className="relative py-24 bg-gradient-to-t from-surface to-background overflow-hidden border-t border-border px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-primary">GET 10% OFF YOUR FIRST ORDER</h2>
          <p className="text-secondary text-sm leading-relaxed">
            Join the stickypicky collectors club. Get early access to limited edition drops, exclusive discount codes, and room design tips.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="bg-primary text-background font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:opacity-90 transition-all inline-block"
            >
              Start Collecting
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
