# ToUpper LLC website

Marketing site for ToUpper LLC: a React single-page app hosted on AWS Amplify, with a
small Amplify Gen 2 backend that delivers contact form messages by email through Amazon SES.

## Requirements

- Node.js **22.22 or newer** (Node 24 recommended; Amplify builds use 24)
- npm 10+

## Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm install`       | Install dependencies                              |
| `npm run dev`       | Start the dev server at http://localhost:5173     |
| `npm run build`     | Type-check, build into `dist/` and pre-render pages |
| `npm run preview`   | Serve the production build locally                |
| `npm test`          | Run all unit tests (site, shared rules, Lambda)   |
| `npm run lint`      | Lint everything with ESLint                       |
| `npm run typecheck` | Type-check the site and shared code               |

## Project layout

```
index.html               Vite entry HTML
src/
  main.tsx               App bootstrap, router, global CSS (load order matters)
  App.tsx                Routes and redirects (all pages share components/Layout.tsx)
  components/            Nav (mobile toggler), Footer, Layout, ConsultationCta
  pages/                 One component per route (each renders <Seo page="..."/>)
  entry-server.tsx       Renders a page to static HTML for the pre-render step
  content/seo.ts         Title, description and canonical path for every page
  content/services.ts    Service descriptions used on Home and Services
  content/work.ts        Projects shown on Our work (add new projects here)
  lib/contactClient.ts   Sends the contact form to the backend
  lib/analytics.ts       Google Tag Manager loader and dataLayer events
  styles/site.css        Theme (colors, type) and page styles, loaded after Bootstrap
shared/contact.ts        Contact validation used by both the browser and the Lambda
amplify/                 Amplify Gen 2 backend (contact Lambda, Function URL, SES access)
amplify.yml              Amplify Hosting build settings
customHttp.yml           HTTP security headers for Amplify Hosting
scripts/prerender.mjs    Writes dist/<page>/index.html after the build
public/                  robots.txt, sitemap.xml, og-image.png (share card), icons
```

Styling is Bootstrap 5.3 (CSS only, no Bootstrap JavaScript) themed through its CSS variables in
`src/styles/site.css`, with headings in Saira (self-hosted via `@fontsource-variable/saira`).

## How the contact form works

The form validates input in the browser with `shared/contact.ts`, then POSTs JSON to a
Lambda Function URL. The Lambda (`amplify/functions/contact/handler.ts`) validates again with
the same rules, silently drops likely bots (a hidden "honeypot" field, or a form submitted in
under 3 seconds), and delivers the message to `CONTACT_TO_EMAIL` in one of two ways:

| Mode | When | What you receive |
| ---- | ---- | ---------------- |
| **SNS** | `CONTACT_FROM_EMAIL` is not set | A plain-text email from `no-reply@sns.amazonaws.com`. No domain needed. Reply by copying the visitor's address from the message. |
| **SES** | `CONTACT_FROM_EMAIL` is set (an address on your own domain, verified in SES) | A normal email from your address, with the visitor as Reply-To. |

The Function URL is published to the site at build time through `amplify_outputs.json`.

## Hosting and deployment

The site runs on **AWS Amplify Hosting** (app `ToUpperLLC`, region us-east-1), connected to the
`master` branch of this repository. **Every push to `master` deploys to production.** Amplify runs
`amplify.yml`: it deploys the backend (`ampx pipeline-deploy`), which writes
`amplify_outputs.json`, then builds the site.

- **Domains:** `https://toupperllc.com` and `https://www.toupperllc.com` (Route 53, HTTPS
  certificate managed by Amplify), plus the default `https://master.d2r6usgstublsy.amplifyapp.com`.
- **Service role:** the app's role has `AmplifyBackendDeployFullAccess` so it can deploy the backend.

### Environment variables

Set in Amplify → Hosting → Environment variables. They're read when the backend deploys, so after
changing one, redeploy (Overview → `master` → Redeploy this version).

| Variable                  | Purpose |
| ------------------------- | ------- |
| `CONTACT_FROM_EMAIL`      | The `noreply@` address on the company domain that contact form emails are sent from (SES). Remove it to fall back to SNS. |
| `CONTACT_TO_EMAIL`        | Where contact form messages are delivered: a Google Group on the company domain that forwards to the team. |
| `CONTACT_ALLOWED_ORIGINS` | The site's URLs, comma-separated, `https://`, no trailing slash: `https://toupperllc.com,https://www.toupperllc.com,https://master.d2r6usgstublsy.amplifyapp.com`. Add any new domain here or the form will be refused there. |

### Email delivery

- **SES** (us-east-1): the `toupperllc.com` domain is verified with Easy DKIM records in Route 53,
  and a DMARC record (`p=none`) is published. Company mail itself runs on Google Workspace (MX and
  SPF records in Route 53).
- **The receiving Google Group must accept outside mail.** Contact form emails are sent by
  Amazon's servers, so Google treats them as external even though they're from `noreply@`. In
  Google Groups → the group → Group settings, *Who can post* is **Anyone on the web**, and the
  Workspace admin setting *Groups for Business → Sharing settings → "Group owners can allow
  incoming email from outside the organization"* is on. If messages stop arriving, check this
  first, then the group's pending/moderation queue.

### Rewrites and redirects

Amplify → Hosting → Rewrites and redirects → Manage redirects (JSON editor). The pre-rendered
pages (see SEO) each have their own rule; everything else falls back to the app shell. Order
matters: the catch-all must be last.

```json
[
  { "source": "/about", "target": "/about/index.html", "status": "200", "condition": null },
  { "source": "/services", "target": "/services/index.html", "status": "200", "condition": null },
  { "source": "/work", "target": "/work/index.html", "status": "200", "condition": null },
  { "source": "/contact", "target": "/contact/index.html", "status": "200", "condition": null },
  { "source": "/privacy", "target": "/privacy/index.html", "status": "200", "condition": null },
  { "source": "/sitemap.xml", "target": "/sitemap.xml", "status": "200", "condition": null },
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
    "target": "/200.html",
    "status": "200",
    "condition": null
  }
]
```

When you add a page, add it to `src/content/seo.ts`, `public/sitemap.xml` and a rule above.

### Limits

The contact Lambda reserves 2 concurrent executions to cap abuse and cost. If a deploy ever fails
with an error about unreserved concurrency (some AWS accounts have a total limit of 10), request a
higher Lambda concurrency quota or remove the `reservedConcurrentExecutions` line in
`amplify/backend.ts`.

## Testing the contact form locally

The site reads the endpoint from `VITE_CONTACT_URL` first, then from `amplify_outputs.json`.

- Against a deployed backend: put `VITE_CONTACT_URL=<function url>` in `.env.local` and run `npm run dev`.
- With your own cloud sandbox (needs AWS credentials): `CONTACT_TO_EMAIL=… npx ampx sandbox`,
  which writes `amplify_outputs.json` for the dev server.

Without either, the form shows its "couldn't be sent" message.

## SEO

- **Page metadata:** every page renders `<Seo page="…" />` (`src/components/Seo.tsx`), which
  outputs the title, meta description, canonical URL and Open Graph / Twitter tags from
  `src/content/seo.ts`. `/sent` and the not-found page are `noindex`. The share image is
  `public/og-image.png` (1200×630).
- **Structured data:** a JSON-LD `ProfessionalService` block in `index.html` (Tampa, FL; serves
  the Tampa Bay area and the U.S.; English and Spanish; the six services). Keep its services in
  step with `src/content/services.ts` (a test checks).
- **robots.txt / sitemap.xml** live in `public/`. Add new indexable pages to both
  `src/content/seo.ts` and `public/sitemap.xml` (a test checks they match).
- **Pre-rendering:** `npm run build` also builds `src/entry-server.tsx` into `dist-ssr/` and runs
  `scripts/prerender.mjs`, which writes `dist/index.html` (home), `dist/<page>/index.html` for
  each indexable page, and `dist/200.html` (the bare app shell). The browser still boots the app
  normally; the static tags are removed once React renders its own.

  Amplify serves them through the rules in [Rewrites and redirects](#rewrites-and-redirects).

**Growing traffic (when ready for clients):**

1. [Google Search Console](https://search.google.com/search-console): add `toupperllc.com` as a
   Domain property (verify with a DNS TXT record in Route 53), then submit
   `https://toupperllc.com/sitemap.xml` under Sitemaps.
2. [Google Business Profile](https://business.google.com): a service-area business for Tampa /
   Tampa Bay with the address hidden, category "Software company", website
   `https://toupperllc.com`, and the services listed on the site.
3. Optional: in Amplify → Custom domains, redirect `www` to the root domain so there's a single
   address.

## Analytics (Google Tag Manager / GA4)

Production builds load Google Tag Manager container `GTM-NQVKC3B5` from `src/lib/analytics.ts`
(called in `src/main.tsx`). Nothing loads in `npm run dev` or tests. Set `VITE_GTM_ID` to use
another container, or to an empty value to turn analytics off. Google Analytics 4
(`G-E2LDXFQ12R`) is configured inside GTM, not in code.

Events pushed to `window.dataLayer` (never names, emails or message text):

| Event           | When                                           | Fields |
| --------------- | ---------------------------------------------- | ------ |
| `page_view`     | Every page, including the first load           | `page_path`, `page_location`, `page_title` |
| `generate_lead` | Contact form sent successfully, before `/sent` | `form: 'contact'` |

**GTM configuration** (tagmanager.google.com → container GTM-NQVKC3B5), for reference if it's
ever rebuilt:

1. *Variables → User-Defined → New → Data Layer Variable* three times: `page_path`,
   `page_location`, `page_title` (name each `DLV - <field>`).
2. *Triggers → New → Custom Event*: event name `page_view`. Another: `generate_lead`.
3. *Tags → New → Google tag*: Tag ID `G-E2LDXFQ12R`, add configuration parameter
   `send_page_view` = `false`, trigger **Initialization - All Pages**.
4. *Tags → New → Google Analytics: GA4 Event*: Measurement ID `G-E2LDXFQ12R`, event name
   `page_view`, event parameters `page_location`, `page_path`, `page_title` set to the three
   Data Layer Variables, trigger: the `page_view` custom event.
5. *Tags → New → Google Analytics: GA4 Event*: Measurement ID `G-E2LDXFQ12R`, event name
   `generate_lead`, trigger: the `generate_lead` custom event.
6. **Submit → Publish** the container.
7. In GA4 → Admin → Events (or Key events), mark `generate_lead` as a key event.

Use GTM's built-in tags only: "Custom HTML" tags are blocked by the Content-Security-Policy.

## Security headers

`customHttp.yml` sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and a Content-Security-Policy for every path. The CSP allows only the
site's own files, Google Tag Manager / Google Analytics, and the contact Lambda Function URL
(`*.lambda-url.us-east-1.on.aws`), so:

- don't add inline `<script>` code to `index.html` (JSON-LD data blocks are fine);
- if you add a third-party script, font, image host or API, add it to the matching directive;
- headers entered in the Amplify console (Hosting → Custom headers and cache) take precedence
  over this file, so keep custom headers in one place.

After deploying, check the headers with `curl -sI https://toupperllc.com` or
[securityheaders.com](https://securityheaders.com), and check the browser console for CSP errors.
