import * as React from 'react';

import {
  DEFAULT_THEME_COLOR,
  THEME_COLOR_CHANGE_EVENT,
  THEME_COLOR_STORAGE_KEY,
  type ThemeColor,
  isThemeColor,
} from './theme-color';

export type ThemeColorContextValue = {
  themeColor: ThemeColor;
  setThemeColor: (themeColor: ThemeColor) => void;
};

const ThemeColorContext = React.createContext<ThemeColorContextValue | null>(
  null,
);
let volatileThemeColor = DEFAULT_THEME_COLOR;

export function ThemeColorProvider({ children }: React.PropsWithChildren) {
  const themeColor = React.useSyncExternalStore(
    subscribeToThemeColor,
    getStoredThemeColor,
    () => DEFAULT_THEME_COLOR,
  );

  const setThemeColor = React.useCallback((nextThemeColor: ThemeColor) => {
    volatileThemeColor = nextThemeColor;
    applyThemeColor(nextThemeColor);

    try {
      if (nextThemeColor === DEFAULT_THEME_COLOR) {
        window.localStorage.removeItem(THEME_COLOR_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, nextThemeColor);
      }
    } catch {
      // The volatile snapshot keeps switching usable without persistent storage.
    }

    window.dispatchEvent(new Event(THEME_COLOR_CHANGE_EVENT));
  }, []);

  React.useEffect(() => {
    applyThemeColor(themeColor);
  }, [themeColor]);

  const value = React.useMemo(
    () => ({ themeColor, setThemeColor }),
    [setThemeColor, themeColor],
  );

  return (
    <ThemeColorContext.Provider value={value}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor(): ThemeColorContextValue {
  const context = React.useContext(ThemeColorContext);

  if (!context) {
    throw new Error('useThemeColor must be used within ThemeColorProvider');
  }

  return context;
}

function subscribeToThemeColor(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_COLOR_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(THEME_COLOR_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THEME_COLOR_CHANGE_EVENT, onStoreChange);
  };
}

function getStoredThemeColor(): ThemeColor {
  try {
    const storedThemeColor = window.localStorage.getItem(
      THEME_COLOR_STORAGE_KEY,
    );

    return isThemeColor(storedThemeColor)
      ? storedThemeColor
      : DEFAULT_THEME_COLOR;
  } catch {
    return volatileThemeColor;
  }
}

function applyThemeColor(themeColor: ThemeColor) {
  if (themeColor === DEFAULT_THEME_COLOR) {
    delete document.documentElement.dataset.themeColor;
    return;
  }

  document.documentElement.dataset.themeColor = themeColor;
}
