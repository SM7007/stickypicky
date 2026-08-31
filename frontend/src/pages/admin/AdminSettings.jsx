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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Delivery Settings</h1>
        <p className="text-gray-400 mt-1">Configure delivery charges for all orders.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

        {/* Delivery Charge */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Delivery Charge (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="1"
              value={deliveryCharge}
              onChange={e => setDeliveryCharge(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="49"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">This amount is added to the cart when the order is below the free delivery threshold.</p>
        </div>

        {/* Free Delivery Above */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Free Delivery Above (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="1"
              value={freeDeliveryAbove}
              onChange={e => setFreeDeliveryAbove(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="500"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">Orders at or above this amount get free delivery.</p>
        </div>

        {/* Preview */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
          <p className="font-semibold mb-1">📦 Preview:</p>
          <p>Orders below ₹{freeDeliveryAbove || '—'} → delivery charge of <strong>₹{deliveryCharge || '—'}</strong></p>
          <p>Orders ₹{freeDeliveryAbove || '—'} and above → <strong>FREE delivery 🎉</strong></p>
        </div>

        {/* Feedback */}
        {success && <p className="text-green-400 text-sm font-medium">{success}</p>}
        {error   && <p className="text-red-400  text-sm font-medium">{error}</p>}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
    </AdminLayout>
  );
}
