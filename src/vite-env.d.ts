/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the contact endpoint (e.g. a sandbox Function URL). */
  readonly VITE_CONTACT_URL?: string;
  /** Google Tag Manager container ID. Defaults to GTM-NQVKC3B5; set it empty to turn analytics off. */
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
