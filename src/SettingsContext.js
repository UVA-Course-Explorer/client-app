import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const defaultSettings = {
  autoFollowCamera: true,
};

const SettingsContext = createContext();

const STORAGE_KEY = 'course-explorer-settings';

function readStoredSettings() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read stored settings', error);
    return null;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const stored = readStoredSettings();
    if (stored) {
      return { ...defaultSettings, ...stored };
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to persist settings', error);
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prevSettings) => ({ ...prevSettings, [key]: value }));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings, updateSetting],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
