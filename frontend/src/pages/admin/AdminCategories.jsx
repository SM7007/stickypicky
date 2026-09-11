import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag, Check, X, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New category form state
  const [newName, setNewName] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [useUrlModeNew, setUseUrlModeNew] = useState(false);
  const [adding, setAdding] = useState(false);
  const newFileInputRef = useRef(null);

  // Edit category state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [useUrlModeEdit, setUseUrlModeEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef(null);

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

  // Handlers for adding category
  const handleNewFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
    setNewImageUrl('');
  };

  const clearNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
    setNewImageUrl('');
    if (newFileInputRef.current) newFileInputRef.current.value = '';
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      setAdding(true);

      if (newImageFile) {
        const formData = new FormData();
        formData.append('name', newName.trim());
        formData.append('image', newImageFile);
        const res = await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`Category "${res.data.name}" created!`);
      } else {
        const res = await api.post('/categories', {
          name: newName.trim(),
          image: newImageUrl.trim() || null,
        });
        toast.success(`Category "${res.data.name}" created!`);
      }

      setNewName('');
      clearNewImage();
      fetchCategories();
    } catch (err) {
      console.error('Failed to create category', err);
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setAdding(false);
    }
  };

  // Handlers for editing category
  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditImageFile(null);
    setEditImagePreview(category.image || '');
    setEditImageUrl(category.image || '');
    setUseUrlModeEdit(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditImageFile(null);
    setEditImagePreview('');
    setEditImageUrl('');
    setUseUrlModeEdit(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    try {
      setSavingEdit(true);

      if (editImageFile) {
        const formData = new FormData();
        formData.append('name', editName.trim());
        formData.append('image', editImageFile);
        const res = await api.put(`/categories/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`Category "${res.data.name}" updated!`);
      } else {
        const res = await api.put(`/categories/${id}`, {
          name: editName.trim(),
          image: editImageUrl.trim() || null,
        });
        toast.success(`Category "${res.data.name}" updated!`);
      }

      handleCancelEdit();
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
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Manage Categories</h1>
            <p className="text-xs text-secondary mt-1">Upload homepage corner cover images and manage product categories</p>
          </div>
        </div>

        {/* Create Category Card */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Plus size={16} className="text-glow" /> Add New Category
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Category Name */}
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Polaroids, Anime, Vintage..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-primary transition-colors"
                  disabled={adding}
                  required
                />
              </div>

              {/* Category Cover Image Upload / URL */}
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Homepage Cover Image (Popular Corners)
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseUrlModeNew(!useUrlModeNew)}
                    className="text-[10px] text-glow hover:underline transition cursor-pointer flex items-center gap-1"
                  >
                    {useUrlModeNew ? <><Upload size={10} /> Switch to File Upload</> : <><LinkIcon size={10} /> Or Paste URL</>}
                  </button>
                </div>

                {!useUrlModeNew ? (
                  /* File Upload Input */
                  <div className="flex items-center gap-3">
                    <input
                      ref={newFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewFileChange}
                      className="hidden"
                      id="new-category-image-file"
                      disabled={adding}
                    />
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      disabled={adding}
                      className="flex-1 bg-background border border-border border-dashed hover:border-primary/60 rounded px-4 py-2.5 text-xs text-secondary hover:text-primary transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {newImageFile ? newImageFile.name : 'Choose Image File to Upload'}
                    </button>

                    {newImagePreview && (
                      <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden border border-border bg-background group">
                        <img src={newImagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={clearNewImage}
                          className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Input */
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => {
                        setNewImageUrl(e.target.value);
                        setNewImagePreview(e.target.value);
                      }}
                      className="flex-1 bg-background border border-border rounded px-4 py-2 text-xs text-primary placeholder:text-secondary/50 focus:outline-none focus:border-primary transition"
                      disabled={adding}
                    />
                    {newImageUrl && (
                      <div className="relative h-9 w-9 shrink-0 rounded overflow-hidden border border-border bg-background">
                        <img
                          src={newImageUrl}
                          alt="preview"
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={adding}
                className="bg-primary text-background font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} />
                {adding ? 'Creating Category...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} retryFn={fetchCategories} />
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
                    <th className="p-4">Cover Image</th>
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
                        {/* Cover Image */}
                        <td className="p-4 w-52">
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="relative h-12 w-12 rounded overflow-hidden border border-border bg-background shrink-0">
                                  {editImagePreview ? (
                                    <img
                                      src={editImagePreview}
                                      alt="Preview"
                                      className="h-full w-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-secondary/40">
                                      <ImageIcon size={18} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <input
                                    ref={editFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditFileChange}
                                    className="hidden"
                                    id={`edit-file-${cat.id}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="px-2 py-1 bg-background border border-border hover:border-primary/60 rounded text-[10px] font-semibold text-primary transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Upload size={10} /> Upload Image
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUseUrlModeEdit(!useUrlModeEdit)}
                                    className="text-[9px] text-secondary hover:text-glow text-left"
                                  >
                                    {useUrlModeEdit ? 'Close URL' : 'Or paste URL'}
                                  </button>
                                </div>
                              </div>

                              {useUrlModeEdit && (
                                <input
                                  type="url"
                                  value={editImageUrl}
                                  onChange={(e) => {
                                    setEditImageUrl(e.target.value);
                                    setEditImagePreview(e.target.value);
                                    setEditImageFile(null);
                                  }}
                                  placeholder="Paste image URL..."
                                  className="w-full bg-background border border-border rounded px-2.5 py-1 text-[11px] text-primary placeholder:text-secondary/50 focus:outline-none focus:border-primary"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded overflow-hidden border border-border bg-background shrink-0">
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-secondary/40">
                                    <ImageIcon size={18} />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-secondary">
                                {cat.image ? (cat.image.startsWith('data:') ? 'Custom Upload' : (cat.image.includes('cloudinary') ? 'Cloud Image' : 'Custom URL')) : 'Default fallback'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Name */}
                        <td className="p-4 font-semibold text-primary">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-background border border-border rounded px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-primary w-44"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-secondary" />
                              <span className="text-sm font-medium">{cat.name}</span>
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
                            productCount > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-surface border border-border text-secondary'
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
                                className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                title="Cancel"
                                className="p-2 bg-surface text-secondary border border-border rounded hover:text-primary transition-colors cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(cat)}
                                title="Edit Category"
                                className="p-2 bg-surface text-secondary border border-border rounded hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name, productCount)}
                                title="Delete Category"
                                className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors cursor-pointer"
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
