import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';
import { PAGES, type PageSeo } from './content/seo';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

const head = () => document.head;
const meta = (selector: string) => head().querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;

const ROUTES: [string, PageSeo][] = [
  ['/', PAGES.home],
  ['/about', PAGES.about],
  ['/services', PAGES.services],
  ['/work', PAGES.work],
  ['/contact', PAGES.contact],
  ['/privacy', PAGES.privacy],
];

describe('page metadata', () => {
  it.each(ROUTES)('%s renders its title, description, canonical and share tags', (path, page) => {
    renderAt(path);
    const url = `https://toupperllc.com${path === '/' ? '/' : path}`;

    expect(document.title).toBe(page.title);
    expect(meta('name="description"')).toBe(page.description);
    expect(head().querySelector('link[rel="canonical"]')).toHaveAttribute('href', url);
    expect(meta('property="og:title"')).toBe(page.title);
    expect(meta('property="og:description"')).toBe(page.description);
    expect(meta('property="og:url"')).toBe(url);
    expect(meta('property="og:image"')).toBe('https://toupperllc.com/og-image.png');
    expect(meta('name="twitter:card"')).toBe('summary_large_image');
    expect(meta('name="twitter:image"')).toBe('https://toupperllc.com/og-image.png');
    expect(meta('name="robots"')).toBeUndefined();
  });

  it.each([
    ['/sent', PAGES.sent],
    ['/does-not-exist', PAGES.notFound],
  ])('%s is kept out of search results', (path, page) => {
    renderAt(path);
    expect(document.title).toBe(page.title);
    expect(meta('name="robots"')).toBe('noindex');
    expect(head().querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('keeps titles and descriptions short and unique', () => {
    const pages = Object.values(PAGES as Record<string, PageSeo>);
    for (const page of pages) {
      expect(page.title.length, page.title).toBeLessThanOrEqual(60);
      expect(page.description.length, page.description).toBeLessThanOrEqual(155);
    }
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  });

  it('renders exactly one title and description per page', () => {
    renderAt('/about');
    expect(head().querySelectorAll('title')).toHaveLength(1);
    expect(head().querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});
