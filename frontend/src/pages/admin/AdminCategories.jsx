import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag, Check, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New category form state
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit category state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories', err);
      setError('Failed to load product categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setAdding(true);
      const res = await api.post('/categories', { name: newName.trim() });
      toast.success(`Category "${res.data.name}" created successfully!`);
      setNewName('');
      fetchCategories();
    } catch (err) {
      console.error('Failed to create category', err);
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await api.put(`/categories/${id}`, { name: editName.trim() });
      toast.success(`Category updated to "${res.data.name}"`);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to update category', err);
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (id, name, productCount) => {
    if (productCount > 0) {
      toast.error(`Cannot delete "${name}". It has ${productCount} active products assigned.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success(`Category "${name}" deleted.`);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Manage Categories</h1>
            <p className="text-xs text-secondary mt-1">Create and manage storefront product categories</p>
          </div>
        </div>

        {/* Create Category Form */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Plus size={16} className="text-glow" /> Add New Category
          </h2>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Category Name (e.g. Polaroids, Anime, Vintage)..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-primary transition-colors"
                disabled={adding}
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="bg-primary text-background font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Tag size={14} />
              {adding ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : categories.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center text-secondary">
            No categories found. Create one above!
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-secondary">
                <thead className="bg-background border-b border-border text-primary font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">URL Slug</th>
                    <th className="p-4 text-center">Active Products</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => {
                    const productCount = cat._count?.products || 0;
                    const isEditing = editingId === cat.id;

                    return (
                      <tr key={cat.id} className="hover:bg-background/50 transition-colors">
                        {/* Name */}
                        <td className="p-4 font-semibold text-primary">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-background border border-border rounded px-3 py-1 text-xs text-primary focus:outline-none focus:border-primary"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-secondary" />
                              <span>{cat.name}</span>
                            </div>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="p-4 font-mono text-secondary">
                          /{cat.slug}
                        </td>

                        {/* Product Count */}
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            productCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface border border-border text-secondary'
                          }`}>
                            {productCount} {productCount === 1 ? 'Product' : 'Products'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                disabled={savingEdit}
                                title="Save changes"
                                className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                title="Cancel"
                                className="p-1.5 bg-surface text-secondary border border-border rounded hover:text-primary transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(cat)}
                                title="Edit Name"
                                className="p-1.5 bg-surface text-secondary border border-border rounded hover:text-primary transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name, productCount)}
                                title="Delete Category"
                                className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
