import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import ProductGrid from '../components/product/ProductGrid';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?limit=4');
        // Filter featured or fallback to first 4
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
    { name: 'Bollywood', slug: 'bollywood', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600' },
    { name: 'Aesthetic', slug: 'aesthetic', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
    { name: 'Sports', slug: 'sports', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-16">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-white">
              <Sparkles size={12} className="text-glow" /> FRESH WALL DROPS LIVE NOW
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] font-display text-white">
              WALLS THAT <br />
              <span className="text-glow font-light italic">SPEAK LOUDER</span>
            </h1>
            <p className="text-secondary text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Premium physical posters. Exclusively conceptualized, designed, and printed on ultra-thick matte paper. Delivered across India.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-white text-black font-bold uppercase tracking-wider text-sm px-8 py-4 rounded hover:bg-zinc-200 transition-colors duration-200 flex items-center gap-2"
              >
                Shop the Drop <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop?category=anime"
                className="border border-white/20 text-white font-semibold uppercase tracking-wider text-sm px-8 py-4 rounded hover:bg-white/5 transition-colors duration-200"
              >
                Anime Collection
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
              <div className="absolute inset-0 bg-surface rounded-lg border border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 transition-transform duration-500 hover:scale-105">
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
              <Truck className="h-6 w-6 text-white" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Free & Fast Shipping</h4>
                <p className="text-xs text-secondary mt-1">Free delivery all over India for orders above ₹500.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 border-y md:border-y-0 md:border-x border-border py-6 md:py-0">
              <ShieldCheck className="h-6 w-6 text-white" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Premium Quality Guaranteed</h4>
                <p className="text-xs text-secondary mt-1">Ultra-thick 300GSM matte paper, museum-grade print quality.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 px-4">
              <Heart className="h-6 w-6 text-white" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Loved by Collectors</h4>
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
            <h2 className="text-3xl font-bold font-display text-white">FEATURED DROPS</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-1.5 hover:opacity-80 transition-opacity">
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
            <h2 className="text-3xl font-bold font-display text-white">POPULAR CORNERS</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-lg overflow-hidden border border-border bg-zinc-900"
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
      <section className="relative py-24 bg-gradient-to-t from-[#050505] to-background overflow-hidden border-t border-border px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">GET 10% OFF YOUR FIRST ORDER</h2>
          <p className="text-secondary text-sm leading-relaxed">
            Join the stickypicky collectors club. Get early access to limited edition drops, exclusive discount codes, and room design tips.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="bg-white text-black font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded hover:bg-zinc-200 transition-all inline-block"
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
