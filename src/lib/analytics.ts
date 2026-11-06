/**
 * Google Tag Manager (which feeds Google Analytics 4; GA4 itself is configured inside GTM).
 * Production builds only: in `npm run dev` and in tests every function here is a no-op.
 *
 * Events pushed to window.dataLayer:
 *   page_view      { page_path, page_location, page_title } on every page, including the first
 *   generate_lead  { form: 'contact' } after the contact form is sent successfully
 * Never push names, emails, messages or other personal details.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const DEFAULT_GTM_ID = 'GTM-NQVKC3B5';

type DataLayerEvent = { event: string } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** The container ID: `VITE_GTM_ID` if set (an empty value turns analytics off), else the default. */
function gtmId(): string {
  return import.meta.env.VITE_GTM_ID ?? DEFAULT_GTM_ID;
}

function enabled(): boolean {
  return Boolean(import.meta.env.PROD && gtmId() && typeof window !== 'undefined');
}

/** Starts GTM: the standard snippet, minus the inline <script> (the CSP doesn't allow those). */
export function initAnalytics() {
  if (!enabled()) return;
  const src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId())}`;
  if (document.querySelector(`script[src="${src}"]`)) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function pushEvent(event: DataLayerEvent) {
  if (!enabled()) return;
  (window.dataLayer = window.dataLayer ?? []).push(event);
}

/**
 * Records a page view whenever the path changes. Called from components/Seo.tsx, which every
 * page renders, so redirect routes (which render no page) aren't counted. Runs after React has
 * put the page's <title> in place. The query string is left out in case it ever holds details.
 */
export function usePageView() {
  const { pathname } = useLocation();
  useEffect(() => {
    pushEvent({
      event: 'page_view',
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
    });
  }, [pathname]);
}
