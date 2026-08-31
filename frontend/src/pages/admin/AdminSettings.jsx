import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { useSettings } from '../../hooks/useSettings';

export default function AdminSettings() {
  const { refetchSettings } = useSettings();
  const [deliveryCharge, setDeliveryCharge]     = useState('');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/settings').then(res => {
      setDeliveryCharge(res.data.deliveryCharge);
      setFreeDeliveryAbove(res.data.freeDeliveryAbove);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/settings', {
        deliveryCharge:    parseFloat(deliveryCharge),
        freeDeliveryAbove: parseFloat(freeDeliveryAbove),
      });
      await refetchSettings();
      setSuccess('✅ Delivery settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-primary">Delivery Settings</h1>
        <p className="text-secondary mt-1 text-xs">Configure delivery charges for all orders.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm">

        {/* Delivery Charge */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            Delivery Charge (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="1"
              value={deliveryCharge}
              onChange={e => setDeliveryCharge(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-3 text-primary text-sm focus:outline-none focus:border-primary transition"
              placeholder="49"
            />
          </div>
          <p className="text-secondary text-xs mt-1">This amount is added to the cart when the order is below the free delivery threshold.</p>
        </div>

        {/* Free Delivery Above */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            Free Delivery Above (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="1"
              value={freeDeliveryAbove}
              onChange={e => setFreeDeliveryAbove(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-3 text-primary text-sm focus:outline-none focus:border-primary transition"
              placeholder="500"
            />
          </div>
          <p className="text-secondary text-xs mt-1">Orders at or above this amount get free delivery.</p>
        </div>

        {/* Preview */}
        <div className="bg-background border border-border rounded-xl p-4 text-xs text-secondary">
          <p className="font-semibold text-primary mb-1">📦 Preview:</p>
          <p>Orders below ₹{freeDeliveryAbove || '—'} → delivery charge of <strong>₹{deliveryCharge || '—'}</strong></p>
          <p>Orders ₹{freeDeliveryAbove || '—'} and above → <strong className="text-emerald-500">FREE delivery 🎉</strong></p>
        </div>

        {/* Feedback */}
        {success && <p className="text-emerald-500 text-sm font-medium">{success}</p>}
        {error   && <p className="text-red-500 text-sm font-medium">{error}</p>}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-background font-bold uppercase tracking-wider text-xs py-4 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
    </AdminLayout>
  );
}
