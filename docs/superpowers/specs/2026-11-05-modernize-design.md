# ToUpper LLC site modernization — design

Date: 2026-11-05
Branch: `modernize`

## Goal

Bring the 2020-era ToUpper LLC marketing site up to a modern, maintainable standard
**without changing its visual design or layout on desktop**. Fix the mobile
experience and replace the (likely dead) contact form with an AWS-native email path.

### Success criteria

1. Desktop rendering of every page (`/`, `/about`, `/apps`, `/websites`, `/contact`,
   `/privacy`, `/sent`) is visually indistinguishable from the current site, verified by
   side-by-side screenshots at 1440px of the old build and the new build.
2. At 375px width every page is usable: working nav menu, no horizontal scroll,
   no overlapping footer, readable text, images scaled to fit.
3. Submitting the contact form delivers an email to the configured inbox via SES,
   with the visitor's address as Reply-To; failures are shown to the user.
4. Runtime dependencies are limited to `react`, `react-dom`, `react-router`, `bootstrap`
   (CSS only). `npm run build`, `npm test`, `npm run lint`, and `npm run typecheck` pass.
5. The site continues to deploy on AWS Amplify from this repository.

### Non-goals

- Visual redesign, new pages, new copy (copy is preserved verbatim).
- Bootstrap 5 migration (would subtly change spacing, typography, and buttons).
- Analytics, CMS, SSR.

## 1. Stack and tooling

| Concern      | Before                          | After                                   |
|--------------|---------------------------------|-----------------------------------------|
| Build        | Create React App 3.4 (react-scripts) | Vite (latest stable)               |
| UI           | React 16                        | React 19                                |
| Routing      | react-router-dom 5 (`Switch`)   | react-router 8, library mode            |
| Language     | JavaScript                      | TypeScript (strict)                     |
| Styling      | 10k-line `App.css` incl. pasted Bootstrap 4 | `bootstrap@4.6.2` CSS + ~100 lines custom CSS |
| Tests        | Jest via react-scripts (unused) | Vitest + Testing Library + jsdom        |
| Lint         | eslint-config-react-app         | ESLint flat config (typescript-eslint, react-hooks) |

Removed dependencies: `reactstrap`, `react-bootstrap`, `react-image-resizer`,
`react-responsive`, `react-getscreen`, `emailjs-com`, `axios`, `express`, `nodemailer`,
`body-parser`, `cookie-parser`, `http-proxy-middleware`, `concurrently`, `nodemon`,
`install`, `react-scripts`, the old `@testing-library/*` versions.

Removed files: `src/serviceWorker.js`, `src/logo.svg`, `src/App.test.js`,
`src/setupTests.js`, `src/contact.css` (unused), `public/favicon 2.ico`,
`public/logo192 2.png`, all `.DS_Store`. A `.gitignore` is added.

`public/index.html` moves to the Vite root `index.html`; title, favicon, manifest,
and theme-color are kept. The meta description is updated from the CRA placeholder.

## 2. Code structure

```
index.html
src/
  main.tsx                 # createRoot, BrowserRouter
  App.tsx                  # <Routes> with a layout route
  components/
    Layout.tsx             # Nav + <Outlet/> + Footer, sticky-footer wrapper
    Nav.tsx                # NavLink items, React-state mobile toggler
    Footer.tsx             # © {current year}
    ProjectCard.tsx        # Bootstrap 4 card markup used by Apps and Websites
  pages/
    Home.tsx About.tsx Apps.tsx Websites.tsx Contact.tsx Privacy.tsx Sent.tsx NotFound.tsx
  lib/
    contactClient.ts       # submitContact() fetch client (validation lives in /shared/contact.ts)
  styles/
    base.css               # custom rules that load before Bootstrap
    app.css                # custom rules that load after Bootstrap + mobile media queries
  assets/img/...           # unchanged images (unused code.jpg removed)
```

- CSS import order in `main.tsx` mirrors the old file's cascade. In the old file the
  custom rules came first and Bootstrap came after, so Bootstrap won ties; a few custom
  rules (`.center`, `.word`, `.box-shadow`) sat after Bootstrap rules. So:
  `styles/base.css` (custom rules that originally preceded Bootstrap) →
  `bootstrap/dist/css/bootstrap.min.css` → `styles/app.css` (custom rules that originally
  followed Bootstrap, plus all mobile media queries). Screenshot comparison confirms it.
- Cards: `ProjectCard` renders the same DOM/classes reactstrap produced
  (`card`, `card-img-top`, `card-body`, `card-text`, `btn btn-secondary`) but the
  "Open" button is an `<a href target="_blank" rel="noopener noreferrer">` instead of
  `window.open`.
- Nav: `NavLink` with `nav-link text-dark` classes inside `li.nav-item`, fixing the
  invalid `<a>`-in-`<li>`-in-`<a>` nesting while keeping the same rendered look.
- Unknown routes render a minimal `NotFound` page (centered text in existing styles).
- The footer shows the current year (`new Date().getFullYear()`), replacing hard-coded 2020.

## 3. Mobile fixes (only below Bootstrap breakpoints)

All changes are inside `@media (max-width: 575.98px)` or `(max-width: 767.98px)`
blocks, or are layout changes that render identically on desktop.

- **Nav toggler:** `useState` open/closed toggles the `show` class on
  `.navbar-collapse`; `aria-expanded` reflects state; menu closes on route change.
  (Previously relied on Bootstrap's jQuery JS, which was never loaded.)
- **`.center`:** on small screens `width: 100%; padding: 2rem 1rem`.
- **About:** desktop keeps the floated 640×740 image and hard line breaks. On small
  screens the image is `float: none; width: 100%; height: auto`, the `<br>`s inside
  the paragraph are hidden (`.App-style br { display: none }` except paragraph
  separators, which become paragraph margins), and `.App-style` margin-left drops to 1rem.
- **Contact form:** `width: 100%; max-width: 400px` (identical on desktop).
- **Footer:** replace `position: absolute; bottom: 0` with a flex column layout
  (`min-height: 100vh` wrapper, footer `margin-top: auto`) so it never overlaps content.
  Looks the same on desktop pages that fit the viewport.
- **Apps/Websites cards:** `col-sm-3` / `col-sm-4` already go full-width under 576px;
  verified, no change expected.

## 4. Contact form (frontend)

- Fields unchanged: First Name, Last Name, Email, Message, same placeholders and labels,
  same `btn btn-primary` "Send" button.
- Controlled form with `useState`; `status: 'idle' | 'sending' | 'error'`.
- Validation (shared rules in `shared/contact.ts`, also used by the Lambda):
  first/last name required, ≤100 chars; email required, valid format, ≤254 chars;
  message required, ≤5000 chars.
  Errors shown with Bootstrap's `is-invalid` / `invalid-feedback` classes.
- Honeypot: a visually hidden `company` field; if filled, the server returns 200 and drops it.
- Submit: `fetch(CONTACT_URL, { method: 'POST', JSON })`. Button disabled with
  "Sending…" while in flight. On 2xx navigate to `/sent`. On failure show an
  `alert alert-danger` message with a fallback ("please try again later").
- `CONTACT_URL` comes from `amplify_outputs.json` (`custom.contactUrl`), read at
  build time. For local dev, `VITE_CONTACT_URL` overrides it; if neither exists the
  form shows the error state rather than failing silently.

## 5. Backend (Amplify Gen 2)

```
amplify/
  backend.ts
  functions/contact/
    resource.ts     # defineFunction({ name: 'contact', timeoutSeconds: 10, environment })
    handler.ts      # Lambda Function URL handler
    handler.test.ts
  package.json / tsconfig.json  (Gen 2 defaults)
```

- `backend.ts`:
  - `defineBackend({ contact })`.
  - Adds a Lambda **Function URL** (`authType: NONE`) with CORS allowing only `POST`
    and `content-type`, origins from `CONTACT_ALLOWED_ORIGINS` (comma-separated;
    defaults to `*` only in sandbox).
  - Reserved concurrency of 2 to cap abuse/cost.
  - IAM: `ses:SendEmail` limited to the identity ARN derived from `CONTACT_FROM_EMAIL`
    (domain identity if the sender is `x@domain`, also the address identity).
  - `backend.addOutput({ custom: { contactUrl } })` so the frontend can read it.
- `handler.ts`:
  - Accepts only `POST` with JSON ≤ 10 KB; else 4xx.
  - Parses, validates with the same rules as the frontend; 400 with field errors on failure.
  - Honeypot filled → 200 no-op.
  - Sends via `@aws-sdk/client-sesv2` `SendEmailCommand`:
    From `CONTACT_FROM_EMAIL`, To `CONTACT_TO_EMAIL`, Reply-To visitor email,
    subject `New contact form message from {First} {Last}`, plain-text body.
  - SES error → log and return 502 with a generic message (no internals leaked).
  - Missing env config → 500 and a clear log line.
- Tests (Vitest, SES client mocked): valid payload sends with correct params; each
  validation failure returns 400; honeypot is a no-op; oversized/invalid JSON rejected;
  SES failure returns 502.

## 6. Deployment

- New `amplify.yml`:
  - backend phase: `npm ci` then `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`
  - frontend phase: `npm run build`, artifacts `dist/**/*`, cache `node_modules`.
- Amplify console (one-time, done by the owner; documented in README):
  1. Verify SES identity (domain or single address) in the same region.
  2. Set env vars `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CONTACT_ALLOWED_ORIGINS`.
  3. Ensure the app has a service role allowing Gen 2 backend deploys
     (`AmplifyBackendDeployFullAccess`).
  4. Keep/confirm the SPA rewrite rule `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` → `/index.html` (200).
- SES sandbox is acceptable: sending to a verified identity works without production access.

## 7. Verification

- Unit tests: contact validation, Contact page states (validation errors, sending,
  success navigation, error alert), Nav toggler, Lambda handler.
- Build old (`react-scripts build` at `master`) and new; serve both and screenshot every
  route at 1440×900 and 375×812 in the browser; compare desktop pairs for parity and
  check mobile shots against section 3.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` clean.
- End-to-end email delivery can only be confirmed after the owner completes the
  console steps; locally `npx ampx sandbox` can exercise it if AWS credentials exist.

## Risks

- **CSS cascade order:** the old file put custom rules *before* Bootstrap, so Bootstrap
  won ties (e.g. `.container`, `body`). Importing Bootstrap first then custom CSS could
  flip a tie. Mitigation: import order matches the original (custom rules that tied with
  Bootstrap are reviewed individually) and screenshot diffing.
- **Bootstrap 4.6.2 vs the pasted copy's version:** the pasted file looks like 4.4/4.5;
  minor differences are possible. Mitigation: screenshot diffing; if any visible
  difference appears, pin the matching 4.x version.
- **Amplify Gen 1 → Gen 2 build:** first deploy needs the service-role step; until the
  SES/env steps are done the form shows its error state (no silent failure).
