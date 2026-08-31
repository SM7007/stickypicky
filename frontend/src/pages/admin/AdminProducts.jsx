import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { formatPrice } from '../../utils/formatPrice';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load admin products', err);
      setError('Could not fetch products list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error('Delete product failed', err);
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} retryFn={fetchProducts} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-white">Products Catalog</h1>
            <p className="text-xs text-secondary mt-1">Manage stickypicky posters, pricing, stock and visibility</p>
          </div>
          <Link
            to="/admin/products/add"
            className="bg-white text-black font-bold uppercase tracking-wider text-xs px-5 py-3 rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5 self-stretch sm:self-auto text-center justify-center"
          >
            <Plus size={14} /> Add Product
          </Link>
        </div>

        {/* Catalog Table */}
        {products.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-surface">
            <p className="text-secondary text-sm">No posters in the catalog yet.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-surface border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-[#161616]/30 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    <th className="p-4 pl-6">Poster Image</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border/40">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#161616]/10 transition-colors">
                      {/* Image */}
                      <td className="p-4 pl-6">
                        <div className="h-16 w-12 rounded bg-zinc-900 border border-border overflow-hidden">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="p-4 max-w-xs">
                        <span className="font-semibold text-white block truncate">{product.name}</span>
                        <span className="text-[10px] text-secondary font-mono truncate block mt-0.5">{product.slug}</span>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded text-white">
                          {product.category?.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <span className="font-semibold text-white">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-secondary line-through block mt-0.5">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>
                          {product.stock} units
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                          product.active ? 'text-emerald-400' : 'text-secondary'
                        }`}>
                          {product.active ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right space-x-3">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-secondary hover:text-white inline-block"
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-secondary hover:text-red-500 inline-block align-middle"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map((product) => (
                <div key={product.id} className="bg-surface border border-border rounded-lg p-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-14 rounded bg-zinc-900 border border-border overflow-hidden shrink-0">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h3 className="font-semibold text-white truncate text-sm">{product.name}</h3>
                      <p className="text-[10px] text-secondary font-mono truncate mt-0.5">{product.slug}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[10px] bg-white/5 border border-border px-2 py-0.5 rounded text-white">
                          {product.category?.name}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold uppercase ${
                          product.active ? 'text-emerald-400' : 'text-secondary'
                        }`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-secondary text-[10px] block">Price</span>
                      <span className="font-semibold text-white">{formatPrice(product.price)}</span>
                    </div>
                    <div>
                      <span className="text-secondary text-[10px] block text-right">Stock</span>
                      <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>
                        {product.stock} units
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-2 bg-white/5 border border-border rounded hover:bg-white/10 text-white"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 text-red-500"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
