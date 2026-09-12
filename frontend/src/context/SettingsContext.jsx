import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const SettingsContext = createContext();

const SETTINGS_STORAGE_KEY = 'stickypicky_site_settings';

const getInitialSettings = () => {
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return {
    deliveryCharge: 49,
    freeDeliveryAbove: 500,
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
  };
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        const nextSettings = {
          deliveryCharge: Number(res.data.deliveryCharge) ?? 49,
          freeDeliveryAbove: Number(res.data.freeDeliveryAbove) ?? 500,
          heroImage1: res.data.heroImage1 || null,
          heroImage2: res.data.heroImage2 || null,
          heroImage3: res.data.heroImage3 || null,
        };
        setSettings(nextSettings);
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
        } catch (e) {
          // Ignore localStorage quota errors
        }
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

