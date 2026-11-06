import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES } from './content/seo';
import { PRERENDER_PATHS, renderPage } from './entry-server';

const template = readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('renderPage', () => {
  it('pre-renders every indexable page', () => {
    expect(PRERENDER_PATHS).toEqual(['/', '/about', '/services', '/work', '/contact', '/privacy']);
  });

  it("puts the page's content in #root and its own tags in <head>", () => {
    const html = renderPage(template, '/about');
    const [head, body] = html.split('</head>');

    expect(head).toContain(`<title data-static-head="">${PAGES.about.title}</title>`);
    expect(head).toContain('<link data-static-head="" rel="canonical" href="https://toupperllc.com/about"/>');
    expect(head).toContain('property="og:image" content="https://toupperllc.com/og-image.png"');
    expect(head).not.toContain(PAGES.home.title.replace('&', '&amp;'));
    expect(head.match(/<title/g)).toHaveLength(1);
    expect(head.match(/name="description"/g)).toHaveLength(1);
    // Structured data and the app script survive.
    expect(head).toContain('application/ld+json');
    expect(body).toMatch(/<div id="root"><div class="App">.*About ToUpper.*<\/div><\/div>/s);
    expect(body).toContain('<script type="module"');
  });

  it('fails loudly if the template has no metadata block to replace', () => {
    expect(() => renderPage('<html><head></head><body><div id="root"></div></body></html>', '/')).toThrow();
  });
});
