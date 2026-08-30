import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import ProductGrid from '../components/product/ProductGrid';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse state from SearchParams
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (categoryParam) query.append('category', categoryParam);
        if (searchParam) query.append('search', searchParam);
        if (sortParam) query.append('sort', sortParam);
        if (minPriceParam) query.append('minPrice', minPriceParam);
        if (maxPriceParam) query.append('maxPrice', maxPriceParam);
        if (inStockParam) query.append('inStock', 'true');

        const res = await api.get(`/products?${query.toString()}`);
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to load shop products', err);
        setError('Failed to fetch posters');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam, inStockParam]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const categories = [
    { name: 'All Posters', slug: '' },
    { name: 'Anime', slug: 'anime' },
    { name: 'Bollywood', slug: 'bollywood' },
    { name: 'Aesthetic', slug: 'aesthetic' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Minimal', slug: 'minimal' },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-white uppercase tracking-wider">
              {categoryParam ? `${categoryParam} Posters` : 'Shop All Posters'}
            </h1>
            {searchParam && (
              <p className="text-xs text-secondary mt-1">
                Showing results for "<span className="text-white font-semibold">{searchParam}</span>"
              </p>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 border border-border px-4 py-2 rounded text-sm text-secondary hover:text-white"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-secondary" />
              <select
                value={sortParam}
                onChange={(e) => updateFilters('sort', e.target.value)}
                className="bg-surface text-secondary hover:text-white border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="featured" className="bg-[#111111] text-white">Featured</option>
                <option value="newest" className="bg-[#111111] text-white">Newest</option>
                <option value="price_asc" className="bg-[#111111] text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-[#111111] text-white">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block space-y-6 sticky top-24">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Categories</h3>
              <div className="flex flex-col space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => updateFilters('category', cat.slug)}
                    className={`text-left text-sm py-1 transition-all duration-150 ${
                      categoryParam === cat.slug
                        ? 'text-white font-semibold pl-1.5 border-l-2 border-white'
                        : 'text-secondary hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilters('minPrice', e.target.value)}
                  className="bg-surface text-white border border-border rounded px-3 py-1.5 text-xs w-full focus:outline-none focus:border-white"
                />
                <span className="text-secondary">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilters('maxPrice', e.target.value)}
                  className="bg-surface text-white border border-border rounded px-3 py-1.5 text-xs w-full focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Availability */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateFilters('inStock', e.target.checked ? 'true' : '')}
                  className="rounded bg-surface border-border text-white focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="text-sm text-secondary hover:text-white select-none">In Stock Only</span>
              </label>
            </div>

            {(categoryParam || searchParam || minPriceParam || maxPriceParam || inStockParam) && (
              <button
                onClick={clearFilters}
                className="w-full text-xs font-bold bg-white text-black py-2 rounded uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </aside>

          {/* Main Grid */}
          <div className="md:col-span-3">
            {error ? (
              <ErrorMessage message={error} retryFn={() => window.location.reload()} />
            ) : (
              <ProductGrid products={products} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-surface border-l border-border h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Categories</h3>
                <div className="flex flex-col space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        updateFilters('category', cat.slug);
                        setMobileFiltersOpen(false);
                      }}
                      className={`text-left text-sm py-1.5 ${
                        categoryParam === cat.slug ? 'text-white font-semibold' : 'text-secondary'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceParam}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    className="bg-[#1a1a1a] text-white border border-border rounded px-3 py-2 text-sm w-full"
                  />
                  <span className="text-secondary">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceParam}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    className="bg-[#1a1a1a] text-white border border-border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateFilters('inStock', e.target.checked ? 'true' : '')}
                    className="rounded bg-[#1a1a1a] border-border text-white h-4 w-4"
                  />
                  <span className="text-sm text-secondary">In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-white text-black py-3 rounded uppercase font-semibold text-xs tracking-wider"
              >
                Apply Filters
              </button>
              {(categoryParam || searchParam || minPriceParam || maxPriceParam || inStockParam) && (
                <button
                  onClick={() => {
                    clearFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full border border-border text-white py-3 rounded uppercase font-semibold text-xs tracking-wider"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Shop;
