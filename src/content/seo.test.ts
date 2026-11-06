import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INDEXABLE_PATHS, SITE_URL, canonicalUrl } from './seo';
import { SERVICES } from './services';

const read = (file: string) => readFileSync(resolve(__dirname, '../..', file), 'utf8');

describe('structured data in index.html', () => {
  const html = read('index.html');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(match?.[1] ?? 'null');

  it('describes the business without a street address', () => {
    expect(data['@type']).toBe('ProfessionalService');
    expect(data.name).toBe('ToUpper LLC');
    expect(data.url).toBe(`${SITE_URL}/`);
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Tampa',
      addressRegion: 'FL',
      addressCountry: 'US',
    });
    expect(data.knowsLanguage).toEqual(['en', 'es']);
    expect(data.areaServed.map((area: { name: string }) => area.name)).toEqual(['Tampa Bay area', 'United States']);
  });

  it('lists every service from content/services.ts', () => {
    const offered = data.hasOfferCatalog.itemListElement.map(
      (offer: { itemOffered: { name: string } }) => offer.itemOffered.name,
    );
    expect(offered).toEqual(SERVICES.map((service) => service.title));
  });
});

describe('robots.txt and sitemap.xml', () => {
  it('robots.txt allows crawling, hides /sent and points to the sitemap', () => {
    const robots = read('public/robots.txt');
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toMatch(/^Disallow: \/sent$/m);
    expect(robots).toMatch(/^Sitemap: https:\/\/toupperllc\.com\/sitemap\.xml$/m);
  });

  it('sitemap.xml lists exactly the indexable pages', () => {
    const sitemap = read('public/sitemap.xml');
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(urls).toEqual(INDEXABLE_PATHS.map(canonicalUrl));
  });
});
