/** Search and link-preview metadata for every page, rendered by components/Seo.tsx. */

export const SITE_URL = 'https://toupperllc.com';
export const SITE_NAME = 'ToUpper LLC';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const LOCATION_LINE = 'Based in Tampa, Florida, working with clients across the U.S.';

export type PageSeo = {
  /** Path on the site, used for the canonical URL. */
  path: string;
  /** Under ~60 characters so search results don't cut it off. */
  title: string;
  /** Under ~155 characters for the same reason. */
  description: string;
  /** Pages search engines should not list (confirmation and error pages). */
  noindex?: boolean;
};

export const PAGES = {
  home: {
    path: '/',
    title: 'Custom Software & Web Development in Tampa | ToUpper LLC',
    description:
      'Tampa software company building websites, web apps, cloud systems and AI automation for businesses across the U.S. Free first consultation.',
  },
  about: {
    path: '/about',
    title: 'About ToUpper | Tampa Software Development Team',
    description:
      'A small Tampa software team building websites, apps and automation since 2019. You work directly with the engineers, in English or Spanish.',
  },
  services: {
    path: '/services',
    title: 'Web, Cloud, Data & AI Development Services | ToUpper LLC',
    description:
      'Custom web and app development, cloud and DevOps, data pipelines, AI automation, modernization and ongoing support, from planning to launch.',
  },
  work: {
    path: '/work',
    title: 'Our Work: Websites and Apps We Built | ToUpper LLC',
    description:
      'A few of the websites and web applications ToUpper LLC has designed, built and launched for clients in Florida and beyond.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Us for a Free Consultation | ToUpper LLC',
    description:
      'Tell us about your project. ToUpper LLC is based in Tampa and works with clients across the U.S. Your first consultation is free.',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | ToUpper LLC',
    description:
      'How ToUpper LLC handles what you send through our contact form and the anonymous analytics we collect on toupperllc.com.',
  },
  sent: {
    path: '/sent',
    title: 'Message Sent | ToUpper LLC',
    description: 'Thanks for reaching out to ToUpper LLC. We will get back to you soon.',
    noindex: true,
  },
  notFound: {
    path: '/404',
    title: 'Page Not Found | ToUpper LLC',
    description: 'The page you are looking for has moved or no longer exists.',
    noindex: true,
  },
} as const satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof PAGES;

/** Paths that search engines should index: the sitemap and the pre-rendered pages. */
export const INDEXABLE_PATHS: readonly string[] = Object.values(PAGES as Record<string, PageSeo>)
  .filter((page) => !page.noindex)
  .map((page) => page.path);

export const canonicalUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);
