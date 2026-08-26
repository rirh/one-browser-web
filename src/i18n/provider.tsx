import { type Locale, defaultLocale, isLocale, translateText } from '@/i18n';
import * as React from 'react';

const storageKey = 'one-browser.locale';
const localeChangeEvent = 'one-browser:locale-change';
const textSources = new WeakMap<Text, TextRecord>();
const attributeSources = new WeakMap<HTMLElement, Map<string, TextRecord>>();
const localizedAttributes = ['alt', 'aria-label', 'placeholder', 'title'];

type TextRecord = {
  source: string;
  translated: string;
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: React.PropsWithChildren) {
  const locale = React.useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    () => defaultLocale,
  );
  const originalTitle = React.useRef('');

  const setLocale = React.useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(storageKey, nextLocale);
    window.dispatchEvent(new Event(localeChangeEvent));
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    originalTitle.current ||= document.title;
    document.title = translateText(originalTitle.current, locale);

    const root = document.body;
    if (!root) {
      return;
    }

    const localizeNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        localizeTextNode(node as Text, locale);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node as HTMLElement;
      localizeElementAttributes(element, locale);
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode) {
        localizeTextNode(textNode as Text, locale);
        textNode = walker.nextNode();
      }

      element
        .querySelectorAll<HTMLElement>(
          localizedAttributes.map((attribute) => `[${attribute}]`).join(','),
        )
        .forEach((child) => localizeElementAttributes(child, locale));
    };

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') {
          localizeTextNode(record.target as Text, locale);
          continue;
        }

        if (record.type === 'attributes') {
          localizeElementAttribute(
            record.target as HTMLElement,
            record.attributeName,
            locale,
          );
          continue;
        }

        record.addedNodes.forEach(localizeNode);
      }
    });

    localizeNode(root);
    observer.observe(root, {
      attributes: true,
      attributeFilter: localizedAttributes,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(localeChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(localeChangeEvent, onStoreChange);
  };
}

function getStoredLocale(): Locale {
  const storedLocale = window.localStorage.getItem(storageKey);

  return isLocale(storedLocale) ? storedLocale : defaultLocale;
}

export function useI18n(): I18nContextValue {
  const context = React.useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}

function localizeTextNode(node: Text, locale: Locale) {
  if (!node.parentElement || isNonVisualElement(node.parentElement)) {
    return;
  }

  const current = node.data;
  const record = textSources.get(node);
  const source =
    record && current === record.translated ? record.source : current;
  const translated = translateVisibleText(source, locale);

  textSources.set(node, { source, translated });

  if (current !== translated) {
    node.data = translated;
  }
}

function localizeElementAttributes(element: HTMLElement, locale: Locale) {
  localizedAttributes.forEach((attribute) =>
    localizeElementAttribute(element, attribute, locale),
  );
}

function localizeElementAttribute(
  element: HTMLElement,
  attribute: string | null,
  locale: Locale,
) {
  if (!attribute || !element.hasAttribute(attribute)) {
    return;
  }

  const current = element.getAttribute(attribute) ?? '';
  const records =
    attributeSources.get(element) ?? new Map<string, TextRecord>();
  const record = records.get(attribute);
  const source =
    record && current === record.translated ? record.source : current;
  const translated = translateText(source, locale);

  records.set(attribute, { source, translated });
  attributeSources.set(element, records);

  if (current !== translated) {
    element.setAttribute(attribute, translated);
  }
}

function isNonVisualElement(element: HTMLElement) {
  return ['SCRIPT', 'STYLE', 'TEMPLATE'].includes(element.tagName);
}

function translateVisibleText(value: string, locale: Locale) {
  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  const translated = translateText(trimmed, locale);
  return translated === trimmed ? value : value.replace(trimmed, translated);
}
