import * as React from 'react';

import {
  APPEARANCE_PREFERENCES_CHANGE_EVENT,
  APPEARANCE_PREFERENCE_DATA_ATTRIBUTES,
  APPEARANCE_PREFERENCE_STORAGE_KEYS,
  type AppearanceFontSize,
  type AppearancePreferences,
  type AppearanceRadius,
  type ContentLayout,
  DEFAULT_APPEARANCE_PREFERENCES,
  isAppearanceFontSize,
  isAppearanceRadius,
  isContentLayout,
} from './appearance-preferences';

export type AppearancePreferencesContextValue = AppearancePreferences & {
  setRadius: (radius: AppearanceRadius) => void;
  setFontSize: (fontSize: AppearanceFontSize) => void;
  setContentLayout: (contentLayout: ContentLayout) => void;
  resetAppearancePreferences: () => void;
};

const AppearancePreferencesContext =
  React.createContext<AppearancePreferencesContextValue | null>(null);

let volatilePreferences: AppearancePreferences = {
  ...DEFAULT_APPEARANCE_PREFERENCES,
};

const DEFAULT_SNAPSHOT = serializeAppearancePreferences(
  DEFAULT_APPEARANCE_PREFERENCES,
);

export function AppearancePreferencesProvider({
  children,
}: React.PropsWithChildren) {
  const snapshot = React.useSyncExternalStore(
    subscribeToAppearancePreferences,
    getAppearancePreferencesSnapshot,
    () => DEFAULT_SNAPSHOT,
  );
  const preferences = React.useMemo(
    () => parseAppearancePreferencesSnapshot(snapshot),
    [snapshot],
  );

  const setRadius = React.useCallback((radius: AppearanceRadius) => {
    updateAppearancePreferences({ radius });
  }, []);

  const setFontSize = React.useCallback((fontSize: AppearanceFontSize) => {
    updateAppearancePreferences({ fontSize });
  }, []);

  const setContentLayout = React.useCallback((contentLayout: ContentLayout) => {
    updateAppearancePreferences({ contentLayout });
  }, []);

  const resetAppearancePreferences = React.useCallback(() => {
    const nextPreferences: AppearancePreferences = {
      ...DEFAULT_APPEARANCE_PREFERENCES,
    };

    volatilePreferences = nextPreferences;
    applyAppearancePreferences(nextPreferences);

    try {
      for (const storageKey of Object.values(
        APPEARANCE_PREFERENCE_STORAGE_KEYS,
      )) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Volatile preferences keep reset usable when storage is unavailable.
    }

    notifyAppearancePreferencesChanged();
  }, []);

  React.useEffect(() => {
    applyAppearancePreferences(preferences);
  }, [preferences]);

  const value = React.useMemo<AppearancePreferencesContextValue>(
    () => ({
      ...preferences,
      setRadius,
      setFontSize,
      setContentLayout,
      resetAppearancePreferences,
    }),
    [
      preferences,
      resetAppearancePreferences,
      setContentLayout,
      setFontSize,
      setRadius,
    ],
  );

  return (
    <AppearancePreferencesContext.Provider value={value}>
      {children}
    </AppearancePreferencesContext.Provider>
  );
}

export function useAppearancePreferences(): AppearancePreferencesContextValue {
  const context = React.useContext(AppearancePreferencesContext);

  if (!context) {
    throw new Error(
      'useAppearancePreferences must be used within AppearancePreferencesProvider',
    );
  }

  return context;
}

function subscribeToAppearancePreferences(onStoreChange: () => void) {
  const storageKeys = new Set<string>(
    Object.values(APPEARANCE_PREFERENCE_STORAGE_KEYS),
  );
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || storageKeys.has(event.key)) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(APPEARANCE_PREFERENCES_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(
      APPEARANCE_PREFERENCES_CHANGE_EVENT,
      onStoreChange,
    );
  };
}

function getAppearancePreferencesSnapshot(): string {
  return serializeAppearancePreferences(readStoredAppearancePreferences());
}

function readStoredAppearancePreferences(): AppearancePreferences {
  try {
    const storedRadius = window.localStorage.getItem(
      APPEARANCE_PREFERENCE_STORAGE_KEYS.radius,
    );
    const storedFontSize = window.localStorage.getItem(
      APPEARANCE_PREFERENCE_STORAGE_KEYS.fontSize,
    );
    const storedContentLayout = window.localStorage.getItem(
      APPEARANCE_PREFERENCE_STORAGE_KEYS.contentLayout,
    );
    const preferences: AppearancePreferences = {
      radius: isAppearanceRadius(storedRadius)
        ? storedRadius
        : DEFAULT_APPEARANCE_PREFERENCES.radius,
      fontSize: isAppearanceFontSize(storedFontSize)
        ? storedFontSize
        : DEFAULT_APPEARANCE_PREFERENCES.fontSize,
      contentLayout: isContentLayout(storedContentLayout)
        ? storedContentLayout
        : DEFAULT_APPEARANCE_PREFERENCES.contentLayout,
    };

    volatilePreferences = preferences;
    return preferences;
  } catch {
    return volatilePreferences;
  }
}

function updateAppearancePreferences(
  patch: Partial<AppearancePreferences>,
): void {
  const nextPreferences = {
    ...readStoredAppearancePreferences(),
    ...patch,
  };

  volatilePreferences = nextPreferences;
  applyAppearancePreferences(nextPreferences);

  try {
    if (patch.radius !== undefined) {
      window.localStorage.setItem(
        APPEARANCE_PREFERENCE_STORAGE_KEYS.radius,
        patch.radius,
      );
    }
    if (patch.fontSize !== undefined) {
      window.localStorage.setItem(
        APPEARANCE_PREFERENCE_STORAGE_KEYS.fontSize,
        patch.fontSize,
      );
    }
    if (patch.contentLayout !== undefined) {
      window.localStorage.setItem(
        APPEARANCE_PREFERENCE_STORAGE_KEYS.contentLayout,
        patch.contentLayout,
      );
    }
  } catch {
    // Volatile preferences keep switching usable when storage is unavailable.
  }

  notifyAppearancePreferencesChanged();
}

function notifyAppearancePreferencesChanged(): void {
  window.dispatchEvent(new Event(APPEARANCE_PREFERENCES_CHANGE_EVENT));
}

function applyAppearancePreferences(preferences: AppearancePreferences): void {
  const root = document.documentElement;

  root.setAttribute(
    APPEARANCE_PREFERENCE_DATA_ATTRIBUTES.radius,
    preferences.radius,
  );
  root.setAttribute(
    APPEARANCE_PREFERENCE_DATA_ATTRIBUTES.fontSize,
    preferences.fontSize,
  );
  root.setAttribute(
    APPEARANCE_PREFERENCE_DATA_ATTRIBUTES.contentLayout,
    preferences.contentLayout,
  );
}

function serializeAppearancePreferences(
  preferences: AppearancePreferences,
): string {
  return [
    preferences.radius,
    preferences.fontSize,
    preferences.contentLayout,
  ].join('|');
}

function parseAppearancePreferencesSnapshot(
  snapshot: string,
): AppearancePreferences {
  const [radius, fontSize, contentLayout] = snapshot.split('|');

  return {
    radius: isAppearanceRadius(radius)
      ? radius
      : DEFAULT_APPEARANCE_PREFERENCES.radius,
    fontSize: isAppearanceFontSize(fontSize)
      ? fontSize
      : DEFAULT_APPEARANCE_PREFERENCES.fontSize,
    contentLayout: isContentLayout(contentLayout)
      ? contentLayout
      : DEFAULT_APPEARANCE_PREFERENCES.contentLayout,
  };
}
