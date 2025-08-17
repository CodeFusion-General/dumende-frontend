/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  readonly VITE_JWT_STORAGE_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_KEYWORDS: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}