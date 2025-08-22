import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsContext = createContext({
  sharingEnabled: false,
  toggleSharing: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [sharingEnabled, setSharingEnabled] = useState(false);

  useEffect(() => {
    // Load setting from storage when app starts
    const loadSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('sharingEnabled');
        if (storedValue !== null) {
          setSharingEnabled(JSON.parse(storedValue));
        }
      } catch (e) {
        console.error('Failed to load sharing setting:', e);
      }
    };
    loadSettings();
  }, []);

  const toggleSharing = async () => {
    const newValue = !sharingEnabled;
    setSharingEnabled(newValue);
    try {
      await AsyncStorage.setItem('sharingEnabled', JSON.stringify(newValue));
    } catch (e) {
      console.error('Failed to save sharing setting:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ sharingEnabled, toggleSharing }}>
      {children}
    </SettingsContext.Provider>
  );
};