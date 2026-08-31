import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  // Sizes variant fields
  const [sizes, setSizes] = useState([
    { size: 'A4', price: '', stock: '' },
    { size: 'A3', price: '', stock: '' },
    { size: 'A2', price: '', stock: '' },
    { size: 'A1', price: '', stock: '' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].id);
      } catch (err) {
        console.error('Failed to load categories', err);
        toast.error('Could not fetch categories list');
      }
    };
    fetchCategories();
  }, []);

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const applyPosterPreset = () => {
    setSizes([
      { size: 'A4', price: '', stock: '' },
      { size: 'A3', price: '', stock: '' },
      { size: 'A2', price: '', stock: '' },
      { size: 'A1', price: '', stock: '' },
    ]);
  };

  const applyStickerPreset = () => {
    setSizes([
      { size: 'Single Die-Cut (3")', price: '', stock: '' },
      { size: 'Pack of 5', price: '', stock: '' },
      { size: 'Pack of 10', price: '', stock: '' },
      { size: 'Sticker Sheet (A5)', price: '', stock: '' },
    ]);
  };

  const addCustomVariant = () => {
    setSizes([...sizes, { size: '', price: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !categoryId || !imageFile) {
      toast.error('Please enter all required fields and upload an image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('stock', stock);
      formData.append('categoryId', categoryId);
      formData.append('image', imageFile);
      formData.append('featured', featured);
      formData.append('active', active);

      // Filter and append sizes with pricing configurations
      const configuredSizes = sizes.filter(s => s.price !== '' && s.stock !== '');
      if (configuredSizes.length > 0) {
        formData.append('sizes', JSON.stringify(configuredSizes));
      }

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Create product failed', err);
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <Link to="/admin/products" className="text-xs text-secondary hover:text-primary inline-flex items-center gap-1.5 mb-4">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Add New Poster</h1>
          <p className="text-xs text-secondary mt-1">Publish a fresh poster design to the store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* General Section */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-2">General Info</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Gojo Satoru Poster"
                  className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface text-primary">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Matte finish poster, fade resistant..."
                className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-2">Pricing & Base Stock</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="299"
                  className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="499"
                  className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Base Stock *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  placeholder="50"
                  className="w-full bg-background text-primary border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Sizes / Variants configuration */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Variant Pricing & Options (Optional)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyPosterPreset}
                  className="text-[10px] font-bold px-2.5 py-1 rounded bg-background border border-border text-primary hover:bg-surface transition cursor-pointer"
                >
                  Poster Presets
                </button>
                <button
                  type="button"
                  onClick={applyStickerPreset}
                  className="text-[10px] font-bold px-2.5 py-1 rounded bg-background border border-border text-primary hover:bg-surface transition cursor-pointer"
                >
                  Sticker Presets
                </button>
              </div>
            </div>

            <p className="text-[10px] text-secondary">
              Configure prices and stock for poster sizes or sticker packs. You can customize variant names freely. Leave blank if product has a single price/stock.
            </p>

            <div className="space-y-3">
              {sizes.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 border border-border p-3 rounded bg-background/50">
                  <input
                    type="text"
                    placeholder="Variant name (e.g. Pack of 5, A4)"
                    value={s.size}
                    onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                    className="w-1/3 min-w-[100px] bg-background text-primary border border-border rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={s.price}
                    onChange={(e) => handleSizeChange(idx, 'price', e.target.value)}
                    className="w-1/3 bg-background text-primary border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={s.stock}
                    onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)}
                    className="w-1/3 bg-background text-primary border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-secondary hover:text-red-500 p-1 cursor-pointer"
                    title="Remove variant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCustomVariant}
              className="text-xs font-semibold text-primary hover:opacity-85 flex items-center gap-1 mt-2 cursor-pointer"
            >
              <Plus size={14} /> Add Another Variant
            </button>
          </div>

          {/* Media upload */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-2">Media Upload</h3>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Poster Image File *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border file:text-xs file:font-semibold file:bg-primary file:text-background hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          {/* Settings checkboxes */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-2">Publish Settings</h3>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-background border-border text-primary h-4 w-4"
                />
                <span className="text-xs font-semibold text-secondary hover:text-primary">Feature in Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-background border-border text-primary h-4 w-4"
                />
                <span className="text-xs font-semibold text-secondary hover:text-primary">Active / Visible</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4">
            <Link
              to="/admin/products"
              className="border border-border text-secondary hover:text-primary py-3 px-6 rounded uppercase font-semibold text-xs tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-background py-3 px-8 rounded uppercase font-bold text-xs tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Poster...' : 'Publish Poster'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
