import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    deliveryCharge: 49,
    freeDeliveryAbove: 500,
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings({
          deliveryCharge: Number(res.data.deliveryCharge) ?? 49,
          freeDeliveryAbove: Number(res.data.freeDeliveryAbove) ?? 500,
          heroImage1: res.data.heroImage1 || null,
          heroImage2: res.data.heroImage2 || null,
          heroImage3: res.data.heroImage3 || null,
        });
      }
    } catch (err) {
      console.warn('Failed to load settings, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
