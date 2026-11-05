/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the contact endpoint (e.g. a sandbox Function URL). */
  readonly VITE_CONTACT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
