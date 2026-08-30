import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
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
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/admin/all`) // get all products then filter to find by ID
        ]);

        setCategories(catRes.data);

        // Find the product by ID
        const matchedProduct = prodRes.data.products.find(p => p.id === id);
        if (!matchedProduct) {
          setError('Product not found in catalog');
          return;
        }

        setName(matchedProduct.name);
        setDescription(matchedProduct.description);
        setPrice(matchedProduct.price);
        setOriginalPrice(matchedProduct.originalPrice || '');
        setStock(matchedProduct.stock);
        setCategoryId(matchedProduct.categoryId);
        setCurrentImage(matchedProduct.image);
        setFeatured(matchedProduct.featured);
        setActive(matchedProduct.active);

        // Map existing sizes if they are configured
        if (matchedProduct.sizes && matchedProduct.sizes.length > 0) {
          const mappedSizes = sizes.map(s => {
            const match = matchedProduct.sizes.find(sz => sz.size === s.size);
            return match ? { size: s.size, price: match.price, stock: match.stock } : s;
          });
          setSizes(mappedSizes);
        }
      } catch (err) {
        console.error('Failed to load product details for editing', err);
        setError('Could not fetch product information');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !categoryId) {
      toast.error('Please enter all required fields');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('originalPrice', originalPrice || '');
      formData.append('stock', stock);
      formData.append('categoryId', categoryId);
      if (imageFile) formData.append('image', imageFile);
      formData.append('featured', featured);
      formData.append('active', active);

      // Filter and append configured sizes
      const configuredSizes = sizes.filter(s => s.price !== '' && s.stock !== '');
      formData.append('sizes', JSON.stringify(configuredSizes));

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Update product failed', err);
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <Link to="/admin/products" className="text-xs text-secondary hover:text-white inline-flex items-center gap-1.5 mb-4">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-white">Edit Poster</h1>
          <p className="text-xs text-secondary mt-1">Modify details for "{name}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* General Section */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border/40 pb-2">General Info</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0a0a0a] text-white">{c.name}</option>
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
                className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white resize-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border/40 pb-2">Pricing & Base Stock</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Base Stock *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="w-full bg-background text-white border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Poster Sizes configuration */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border/40 pb-2">
              Size Specific Variant Pricing (Optional)
            </h3>
            <p className="text-[10px] text-secondary">
              Configure prices and stocks for size models. If left blank, sizes will not be added and the base price/stock will be used.
            </p>

            <div className="space-y-3">
              {sizes.map((s, idx) => (
                <div key={s.size} className="flex items-center gap-4 border border-border/40 p-3 rounded bg-background/50">
                  <span className="w-12 text-xs font-bold text-white uppercase">{s.size}</span>
                  <input
                    type="number"
                    placeholder="Price for size"
                    value={s.price}
                    onChange={(e) => handleSizeChange(idx, 'price', e.target.value)}
                    className="w-full bg-background text-white border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-white"
                  />
                  <input
                    type="number"
                    placeholder="Stock for size"
                    value={s.stock}
                    onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)}
                    className="w-full bg-background text-white border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Media upload */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border/40 pb-2">Media Upload</h3>
            {currentImage && (
              <div className="mb-4">
                <span className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Current Poster</span>
                <img src={currentImage} className="h-32 w-24 rounded object-cover border border-border" alt="Current poster representation" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Replace Poster Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Settings checkboxes */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border/40 pb-2">Publish Settings</h3>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-background border-border text-white h-4 w-4"
                />
                <span className="text-xs font-semibold text-secondary hover:text-white">Feature in Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-background border-border text-white h-4 w-4"
                />
                <span className="text-xs font-semibold text-secondary hover:text-white">Active / Visible</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4">
            <Link
              to="/admin/products"
              className="border border-border text-secondary hover:text-white py-3 px-6 rounded uppercase font-semibold text-xs tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black py-3 px-8 rounded uppercase font-bold text-xs tracking-wider hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Poster'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEditProduct;
