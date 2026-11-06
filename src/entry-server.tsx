/**
 * Server entry used only by the build's pre-render step (scripts/prerender.mjs). It renders a
 * page to static HTML so crawlers and link-preview bots see the content and the page's own
 * metadata without running JavaScript. The browser still boots normally from src/main.tsx.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { INDEXABLE_PATHS } from './content/seo';

export const PRERENDER_PATHS = INDEXABLE_PATHS;

const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/;
const ROOT = '<div id="root"></div>';
// React 19 emits hoisted <title>, <meta> and <link> tags ahead of the markup.
const LEADING_HEAD_TAGS = /^(?:<title>[\s\S]*?<\/title>|<meta [^>]*\/>|<link [^>]*\/>)+/;

/** Returns index.html (`template`) with `url`'s markup in #root and its metadata in <head>. */
export function renderPage(template: string, url: string): string {
  if (!SEO_BLOCK.test(template) || !template.includes(ROOT)) {
    throw new Error('index.html is missing the <!--seo--> block or an empty #root');
  }

  const rendered = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const headTags = rendered.match(LEADING_HEAD_TAGS)?.[0] ?? '';
  const markup = rendered.slice(headTags.length);
  // Marked so the browser removes them once React renders its own copies (lib/staticHead.ts).
  const marked = headTags.replace(/<(title|meta|link)\b/g, '<$1 data-static-head=""');

  return template
    .replace(SEO_BLOCK, () => `<!--seo-->${marked}<!--/seo-->`)
    .replace(ROOT, () => `<div id="root">${markup}</div>`);
}
