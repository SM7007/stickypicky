import React, { useState, useRef } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { useSettings } from '../../hooks/useSettings';
import { Upload, Link as LinkIcon, X, ImageIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CARD_INFO = [
  {
    key: 'heroImage1',
    label: 'Card 1 — Front (most visible)',
    description: 'The top card in the hero poster stack. Biggest visual impact.',
    badge: 'FRONT',
    badgeColor: 'bg-primary text-background',
  },
  {
    key: 'heroImage2',
    label: 'Card 2 — Middle',
    description: 'Slightly behind and to the left. Adds depth to the stack.',
    badge: 'MIDDLE',
    badgeColor: 'bg-zinc-600 text-white',
  },
  {
    key: 'heroImage3',
    label: 'Card 3 — Back',
    description: 'Furthest back and faintest. Completes the layered look.',
    badge: 'BACK',
    badgeColor: 'bg-zinc-700 text-white',
  },
];

const FALLBACKS = {
  heroImage1: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
  heroImage2: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600',
  heroImage3: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600',
};

export default function AdminHomepageImages() {
  const { settings, refetchSettings } = useSettings();

  const [images, setImages] = useState({
    heroImage1: settings.heroImage1 || '',
    heroImage2: settings.heroImage2 || '',
    heroImage3: settings.heroImage3 || '',
  });

  const [uploading, setUploading] = useState({
    heroImage1: false,
    heroImage2: false,
    heroImage3: false,
  });
  const [saving, setSaving] = useState(false);

  const fileRef1 = useRef();
  const fileRef2 = useRef();
  const fileRef3 = useRef();
  const fileRefs = { heroImage1: fileRef1, heroImage2: fileRef2, heroImage3: fileRef3 };

  const handleFileUpload = (key, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [key]: true }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages(prev => ({ ...prev, [key]: reader.result }));
      setUploading(u => ({ ...u, [key]: false }));
      toast.success('Image loaded — click Save to apply.');
    };
    reader.onerror = () => {
      toast.error('Could not read the file.');
      setUploading(u => ({ ...u, [key]: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        heroImage1: images.heroImage1 || null,
        heroImage2: images.heroImage2 || null,
        heroImage3: images.heroImage3 || null,
      });
      await refetchSettings();
      toast.success('✅ Homepage images saved!');
    } catch (err) {
      console.error('Save failed', err);
      toast.error(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearImage = (key) => setImages(prev => ({ ...prev, [key]: '' }));
  const previewSrc = (key) => images[key] || FALLBACKS[key];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">
            Homepage Images
          </h1>
          <p className="text-xs text-secondary mt-1">
            Manage the 3 poster cards shown in the hero section of your storefront. Changes are live immediately after saving.
          </p>
        </div>

        {/* Live Stack Preview */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-6">Live Stack Preview</p>
          <div className="flex justify-center items-center py-4">
            <div className="relative w-44 h-56">
              {/* Card 3 — back */}
              <div className="absolute inset-0 rounded-lg overflow-hidden rotate-6 translate-x-10 translate-y-5 shadow-xl scale-95 opacity-40 border border-border">
                <img src={previewSrc('heroImage3')} className="w-full h-full object-cover" alt="Card 3" />
              </div>
              {/* Card 2 — middle */}
              <div className="absolute inset-0 rounded-lg overflow-hidden -rotate-6 -translate-x-6 translate-y-1 shadow-xl scale-95 opacity-70 border border-border">
                <img src={previewSrc('heroImage2')} className="w-full h-full object-cover" alt="Card 2" />
              </div>
              {/* Card 1 — front */}
              <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl z-10 border border-border">
                <img src={previewSrc('heroImage1')} className="w-full h-full object-cover" alt="Card 1" />
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-secondary mt-4">
            This mirrors how the cards appear on the home page hero section.
          </p>
        </div>

        {/* Card editors */}
        <div className="space-y-5">
          {CARD_INFO.map(({ key, label, description, badge, badgeColor }) => (
            <div key={key} className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
              {/* Card header */}
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${badgeColor}`}>
                  {badge}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-primary">{label}</h3>
                  <p className="text-[11px] text-secondary mt-0.5">{description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                {/* Thumbnail preview */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-background group w-full max-w-[140px]">
                  {images[key] ? (
                    <>
                      <img src={images[key]} alt={label} className="w-full h-full object-cover" />
                      <button
                        onClick={() => clearImage(key)}
                        className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-secondary relative">
                      <img src={FALLBACKS[key]} alt="default" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                      <ImageIcon size={24} className="opacity-40 relative z-10" />
                      <span className="text-[10px] relative z-10">Default</span>
                    </div>
                  )}
                </div>

                {/* Upload & URL controls */}
                <div className="space-y-3 flex flex-col justify-center">
                  {/* Hidden file input */}
                  <input
                    ref={fileRefs[key]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`file-${key}`}
                    onChange={(e) => handleFileUpload(key, e.target.files[0])}
                  />
                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => fileRefs[key].current?.click()}
                    disabled={uploading[key]}
                    id={`upload-${key}`}
                    className="w-full flex items-center justify-center gap-2 border border-border rounded px-4 py-2.5 text-xs font-semibold text-primary hover:bg-background transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Upload size={13} />
                    {uploading[key] ? 'Loading…' : 'Upload Image File'}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-secondary font-semibold uppercase">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* URL input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">
                      <LinkIcon size={10} className="inline mr-1" />
                      Paste Image URL
                    </label>
                    <input
                      type="url"
                      id={`url-${key}`}
                      value={images[key].startsWith('data:') ? '' : images[key]}
                      onChange={(e) => setImages(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-primary placeholder:text-secondary/50 focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  {/* Clear button */}
                  {images[key] && (
                    <button
                      type="button"
                      onClick={() => clearImage(key)}
                      className="text-[10px] text-secondary hover:text-red-400 transition-colors flex items-center gap-1 self-start"
                    >
                      <X size={10} /> Clear (restore default)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            id="save-homepage-images"
            className="flex items-center gap-2 bg-primary text-background font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Homepage Images'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
