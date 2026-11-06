import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { initAnalytics, pushEvent } from './analytics';

const gtmScripts = () => document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtm.js"]');
const pageViews = () => (window.dataLayer ?? []).filter((e) => (e as { event?: string }).event === 'page_view');

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.dataLayer;
  gtmScripts().forEach((s) => s.remove());
});

describe('analytics outside production', () => {
  it('does nothing', () => {
    initAnalytics();
    pushEvent({ event: 'generate_lead' });
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(gtmScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });
});

describe('analytics in production', () => {
  it('loads the Google Tag Manager container once', () => {
    vi.stubEnv('PROD', true);
    initAnalytics();
    initAnalytics();

    expect(gtmScripts()).toHaveLength(1);
    const script = gtmScripts()[0] as HTMLScriptElement;
    expect(script.src).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-NQVKC3B5');
    expect(script.async).toBe(true);
    expect(window.dataLayer?.[0]).toMatchObject({ event: 'gtm.js', 'gtm.start': expect.any(Number) });
  });

  it('uses VITE_GTM_ID when set and can be switched off with an empty value', () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
    initAnalytics();
    expect((gtmScripts()[0] as HTMLScriptElement).src).toContain('id=GTM-TEST123');

    gtmScripts().forEach((s) => s.remove());
    delete window.dataLayer;
    vi.stubEnv('VITE_GTM_ID', '');
    initAnalytics();
    expect(gtmScripts()).toHaveLength(0);
  });

  it('pushes one page_view per page, including the first, and none for redirects', async () => {
    vi.stubEnv('PROD', true);
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/apps']}>
        <App />
      </MemoryRouter>,
    );

    expect(pageViews()).toEqual([
      {
        event: 'page_view',
        page_path: '/',
        page_location: `${window.location.origin}/`,
        page_title: 'Custom Software & Web Development in Tampa | ToUpper LLC',
      },
    ]);

    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(pageViews()).toHaveLength(2);
    expect(pageViews()[1]).toMatchObject({
      page_path: '/about',
      page_title: 'About ToUpper | Tampa Software Development Team',
    });
  });
});
