import { OG_IMAGE, PAGES, SITE_NAME, canonicalUrl, type PageKey, type PageSeo } from '../content/seo';

/**
 * Title, description, canonical URL and share-card tags for one page. React 19 hoists these
 * into <head>, both in the browser and in the pre-rendered HTML.
 */
export default function Seo({ page }: { page: PageKey }) {
  const { path, title, description, noindex } = PAGES[page] as PageSeo;
  const url = noindex ? undefined : canonicalUrl(path);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="ToUpper LLC logo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}
