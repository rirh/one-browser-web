import { useEffect } from 'react';

import pkg from '../../../package.json';

export default function BuildInfo() {
  useEffect(() => {
    const print = (key: string, value: string) =>
      console.log(
        `%c ${key} %c ${value} %c `,
        'background:#20232a ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
        'background:#61dafb ;padding: 1px; border-radius: 0 3px 3px 0;  color: #20232a; font-weight: bold;',
        'background:transparent',
      );
    const envRows = getEnvironmentRows();

    print(pkg.name, pkg.version);
    print('build time', __APP_BUILD_TIME__);

    console.groupCollapsed('[build-info] environment');
    console.table(envRows);
    console.groupEnd();
  }, []);
  return null;
}

function getEnvironmentRows() {
  return Object.entries({
    MODE: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
    APP_BUILD_TIME: __APP_BUILD_TIME__,
    VITE_DESKTOP_API_MOCK: import.meta.env.VITE_DESKTOP_API_MOCK,
    VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
    VITE_WEB_LOGIN_URL: import.meta.env.VITE_WEB_LOGIN_URL,
  })
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({
      key: `env.${key}`,
      value: formatConsoleValue(value),
    }));
}

function formatConsoleValue(value: unknown) {
  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  return String(value);
}
