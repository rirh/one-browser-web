/// <reference types="vite/client" />

declare const __APP_BUILD_TIME__: string;
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_DEV_BACKEND_URL?: string;
  readonly VITE_WEB_LOGIN_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_DESKTOP_API_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
