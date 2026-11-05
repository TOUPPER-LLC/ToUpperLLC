# ToUpper LLC Site Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the CRA/React 16 site to Vite + React 19 + TypeScript with identical desktop visuals, a working mobile layout, and a contact form that emails via an Amplify Gen 2 Lambda + SES.

**Architecture:** Static SPA built by Vite, served by Amplify Hosting with an SPA rewrite. Pages are thin components under a layout route. The contact form POSTs JSON to a Lambda Function URL defined in `amplify/`; validation rules live in `shared/` and are imported by both the browser and the Lambda.

**Tech Stack:** Vite 8, React 19.3, react-router 8 (library mode), TypeScript ~6.0, bootstrap 4.6.2 (CSS only), Vitest 5 + Testing Library + jsdom, ESLint 10 flat config, Amplify Gen 2 (`@aws-amplify/backend` 1.x, aws-cdk-lib 2.x), `@aws-sdk/client-sesv2`.

**Spec:** `docs/superpowers/specs/2026-11-05-modernize-design.md`

## Global Constraints

- Desktop (1440×900) rendering of `/`, `/about`, `/apps`, `/websites`, `/contact`, `/privacy`, `/sent` must match the baseline screenshots from Task 0.
- All page copy is preserved verbatim (including the About `<br>` line breaks on desktop).
- Runtime `dependencies` are exactly: `react`, `react-dom`, `react-router`, `bootstrap@4.6.2`. Everything else is a devDependency. (The Amplify backend's `@aws-sdk/client-sesv2` is a devDependency; esbuild bundles it into the Lambda.)
- TypeScript pinned `~6.0` (typescript-eslint requires `<6.1`).
- Node ≥ 22.22 (react-router 8 engine); Amplify build uses Node 24.
- Mobile CSS changes live only inside `@media (max-width: 575.98px)` / `(max-width: 767.98px)` blocks, except the sticky-footer layout and the contact form's `width:100%; max-width:400px`.
- Validation limits: first/last name required ≤ 100 chars; email required, valid, ≤ 254 chars; message required ≤ 5000 chars; request body ≤ 10 KB.
- Lambda env vars: `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CONTACT_ALLOWED_ORIGINS`.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work stays on branch `modernize`.

## Review Focus

1. **Header injection / control characters in names:** a first name containing `\r\n` must be rejected (it is interpolated into the email subject). → Task 3 test `rejects control characters in names`.
2. **Whitespace-only fields:** `"   "` for any required field is treated as empty. → Task 3 test `trims and treats whitespace as empty`.
3. **Double submit:** clicking Send twice fires exactly one request. → Task 4 test `disables submit while sending`.
4. **Non-JSON / network failure responses** (CORS block, 502 HTML page, `fetch` rejects): form shows the error alert, never crashes or navigates. → Task 4 tests `shows error on network failure` and `shows error on non-JSON 502`.
5. **Base64-encoded Function URL bodies** (`isBase64Encoded: true`): handler decodes before parsing. → Task 5 test `decodes base64 bodies`.

Not unit-testable, covered in Task 7 verification: deep-link refresh on `/about` returns the page (SPA rewrite).

---

### Task 0: Capture baseline screenshots of the current site

**Files:**
- Create: `.baseline/` (gitignored in Task 1; not committed)

- [ ] **Step 1:** In a worktree of `master` (`git worktree add ../ToUpperLLC-baseline master`), symlink or copy the existing `node_modules` from the main checkout and run `NODE_OPTIONS=--openssl-legacy-provider npx react-scripts build`. Expected: `build/` produced. If the build cannot run on Node 26, fall back to `nvm use 16` for this step only.
- [ ] **Step 2:** Serve `build/` as an SPA (`npx serve -s build -l 5001`).
- [ ] **Step 3:** Screenshot each of the 7 routes at 1440×900 and 375×812 (full page) into `.baseline/{route}-{desktop|mobile}.png` (`home` for `/`).
- [ ] **Step 4:** Stop the server; remove the worktree (`git worktree remove ../ToUpperLLC-baseline`).

### Task 1: Vite + React 19 + TS scaffold with ported pages and split CSS

**Files:**
- Delete: `src/App.js`, `src/Nav.js`, `src/index.js`, `src/components/*.js`, `src/serviceWorker.js`, `src/logo.svg`, `src/App.test.js`, `src/setupTests.js`, `src/contact.css`, `src/App.css`, `src/index.css`, `src/assets/img/code.jpg`, `public/index.html`, `public/favicon 2.ico`, `public/logo192 2.png`, every `.DS_Store`, `package-lock.json`
- Create: `.gitignore` (`node_modules`, `dist`, `.baseline`, `.amplify`, `amplify_outputs.json`, `.DS_Store`, `*.local`)
- Create: `index.html` (root; keeps title `ToUpper LLC`, favicon, apple-touch-icon, manifest, theme-color `#000000`, viewport; description `ToUpper LLC builds web and mobile applications.`)
- Rewrite: `package.json` (name `toupper-llc`, `"type": "module"`, `engines.node >=22.22`, scripts below)
- Create: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `src/test/setup.ts`
- Create: `src/main.tsx`, `src/App.tsx`, `src/components/{Layout,Nav,Footer,ProjectCard}.tsx`, `src/pages/{Home,About,Apps,Websites,Contact,Privacy,Sent,NotFound}.tsx`, `src/styles/{base,app}.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App` (default export, renders `<Routes>`; expects to be inside a router so tests can use `MemoryRouter`); `ProjectCard({ title: string; image: string; href: string; colClass: string })`; `Layout` (Nav + `<Outlet/>` + Footer); page components as default exports.
- Scripts: `dev` = `vite`, `build` = `tsc --noEmit && vite build`, `preview` = `vite preview`, `test` = `vitest run`, `lint` = `eslint .`, `typecheck` = `tsc --noEmit`.

- [ ] **Step 1: Remove CRA files and dependencies.** `rm -rf node_modules package-lock.json` and delete the files listed above. Write the new `package.json` and install: `npm i react@^19.3.1 react-dom@^19.3.1 react-router@^8.5.1 bootstrap@4.6.2` and `npm i -D vite@^8.3.6 @vitejs/plugin-react@^6.2.1 typescript@~6.0.3 @types/react@^19.3.0 @types/react-dom @types/node@^24 vitest@^5.1.0 jsdom@^31 @testing-library/react@^16.3.3 @testing-library/user-event@^14.6.8 @testing-library/jest-dom@^7.0.1 eslint@^10 @eslint/js typescript-eslint@^8.72.1 eslint-plugin-react-hooks@^7.1.1 globals`. Expected: install succeeds with no peer errors.
- [ ] **Step 2: Config.** `vite.config.ts` uses `@vitejs/plugin-react`, `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: false }`. `tsconfig.json`: `strict`, `jsx: react-jsx`, `moduleResolution: bundler`, `types: ["vite/client"]`, includes `src`, `shared`, `vite.config.ts`. `setup.ts` imports `@testing-library/jest-dom/vitest`. ESLint flat config: js recommended + typescript-eslint recommended + react-hooks recommended, ignores `dist`, `.amplify`.
- [ ] **Step 3: Write the failing test** `src/App.test.tsx`: render `<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>` for each route and assert:
  - `/` → `getByAltText('logo')`
  - `/about` → `getByText(/Since 2019, we have been providing/)`
  - `/apps` → `getByText('Krazy Ball')` and the Open link has `href` `https://play.google.com/store/apps/details?id=com.ToUpperLLC.BallKrazy&hl=en_US`, `target="_blank"`, `rel="noopener noreferrer"`
  - `/websites` → `getByText('Say No To Bugs')`, link `href` `http://saynotobugsflorida.com/`
  - `/privacy` → `getByText(/understand the importance of privacy/)`
  - `/sent` → heading `Thank you for contacting us`
  - `/nope` → `getByText(/page not found/i)`
  - every route → footer contains `© ${new Date().getFullYear()}`
- [ ] **Step 4:** `npm test` → FAIL (App missing).
- [ ] **Step 5: CSS split.** From the old `src/App.css` keep only non-Bootstrap rules: `base.css` gets the rules that appeared before the Bootstrap block (`.App`, `.App-logo` + spin animation/keyframes, `.App-header`, `.App-header2`, `.App-header3`, `.App-font`, `.App-style`, `.App-link`, `.border-top`, `.border-bottom`, `.footer`, `.text-muted`) plus old `index.css` body/code rules; `app.css` gets the custom rules that appeared after Bootstrap rules (`.center`, `.word`, `.box-shadow`, and any other non-Bootstrap selector found by diffing the old file against `bootstrap@4.6.2/dist/css/bootstrap.css`). `main.tsx` imports `./styles/base.css`, then `bootstrap/dist/css/bootstrap.min.css`, then `./styles/app.css`. Leave `.footer` positioning as-is in this task.
- [ ] **Step 6: Port components.** `main.tsx`: `createRoot` + `<StrictMode><BrowserRouter><App/></BrowserRouter></StrictMode>`. `App.tsx`: `<div className="App"><Routes><Route element={<Layout/>}>…index + 6 paths + `*`→NotFound</Route></Routes></div>`. Pages copy JSX/copy verbatim from the old components, `class`→`className`, comments removed. About uses a plain `<img src={code2} width={640} height={740} className="about-image" alt="">` with `.about-image { float: right; }` in `app.css` (matches old `react-image-resizer` output; check its rendered style in the baseline and copy exact sizing). Apps/Websites use `ProjectCard` rendering `div.container > div.row > div.{colClass} > div.card > img.card-img-top + div.card-body > p.card-text + div(flex center) > a.btn.btn-secondary "Open"`. Nav: `nav.navbar…` same classes; items `li.nav-item > NavLink.nav-link.text-dark`, toggler button present (wired in Task 2). Footer: `footer.border-top.footer.text-muted > div.container`. NotFound: `div.center > h1 "Page not found"`.
- [ ] **Step 7:** `npm test` → PASS. `npm run lint`, `npm run typecheck`, `npm run build` → clean.
- [ ] **Step 8: Visual parity.** `npm run build && npx vite preview --port 5002`; screenshot the 7 routes at 1440×900 and compare with `.baseline/*-desktop.png`. Fix any difference (cascade order, Bootstrap version) until they match. Record any residual difference in the commit message.
- [ ] **Step 9: Commit** — `git add -A && git commit -m "refactor: migrate CRA/React 16 to Vite + React 19 + TypeScript"`.

### Task 2: Mobile layout — nav toggler, sticky footer, responsive pages

**Files:**
- Modify: `src/components/Nav.tsx`, `src/components/Layout.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx` (form width class only), `src/styles/app.css`
- Test: `src/components/Nav.test.tsx`

**Interfaces:**
- Consumes: `Layout`, `Nav` from Task 1.

- [ ] **Step 1: Write the failing tests** in `Nav.test.tsx` (render `<MemoryRouter><App/></MemoryRouter>`):
  - `toggler opens and closes the menu`: `.navbar-collapse` lacks `show`; click button named `Toggle navigation` → has `show` and button `aria-expanded="true"`; click again → no `show`.
  - `menu closes after navigating`: open, click link `About` → `.navbar-collapse` lacks `show` and About text is shown.
- [ ] **Step 2:** `npm test -- Nav` → FAIL.
- [ ] **Step 3: Implement** toggler with `useState<boolean>`; close via `useLocation()` change (reset in an effect keyed on `pathname`, or close in each `NavLink` `onClick`). Toggler button gets `aria-controls="main-nav"`, collapse div `id="main-nav"`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: CSS.** Layout wrapper `div.site` = `display:flex; flex-direction:column; min-height:100vh`; `main` = `flex: 1 0 auto`; `.footer` drops `position:absolute; bottom:0` (keeps `width:100%; white-space:nowrap; line-height:60px`). Under 575.98px: `.center { width:100%; padding:2rem 1rem }`, `.App-style { margin-left:1rem; margin-right:1rem }`, `.App-style br { display:none }` with About's paragraph breaks converted to separate `<span class="d-block mb-3">` blocks so the double-`<br>` separators still separate on mobile (desktop output must be unchanged — verify), `.about-image { float:none; width:100%; height:auto }`, `.App-logo { height: 60vmin }` only if the baseline mobile logo is unreadably small. Contact form: `style={{width:'400px'}}` → `className="contact-form"` with `.contact-form { width:100%; max-width:400px }`.
- [ ] **Step 6:** Rebuild + preview; screenshot all routes at 375×812: no horizontal scroll (`document.documentElement.scrollWidth <= 375`), footer below content, menu opens. Re-screenshot 1440×900 and confirm desktop still matches baseline.
- [ ] **Step 7: Commit** — `fix: responsive mobile layout and working nav toggler`.

### Task 3: Shared contact validation

**Files:**
- Create: `shared/contact.ts`
- Test: `shared/contact.test.ts`

**Interfaces:**
- Produces:
  - `type ContactInput = { firstName: string; lastName: string; email: string; message: string; company?: string }` (`company` = honeypot)
  - `type ContactErrors = Partial<Record<'firstName'|'lastName'|'email'|'message', string>>`
  - `const LIMITS = { name: 100, email: 254, message: 5000, bodyBytes: 10_240 }`
  - `function normalizeContact(raw: unknown): ContactInput` — coerces non-strings to `''`, trims all fields.
  - `function validateContact(input: ContactInput): ContactErrors` — empty object means valid.

- [ ] **Step 1: Write failing tests:**
  - `accepts a valid submission` → `{}`
  - `requires every field` → all four keys present for empty input
  - `trims and treats whitespace as empty` → `normalizeContact({firstName:'  '})` then validate → has `firstName`
  - `enforces length limits` → 101-char name, 255-char email, 5001-char message each produce errors; exactly-at-limit values pass
  - `rejects invalid email` → `'jane'`, `'jane@'`, `'jane@x'` fail; `'jane@doe.com'` passes
  - `rejects control characters in names` → `'Jane\r\nBcc: x@y.com'` → `firstName` error
  - `normalizeContact ignores non-string values` → `{firstName: 5}` → `firstName === ''`
- [ ] **Step 2:** `npx vitest run shared` → FAIL.
- [ ] **Step 3: Implement.** Email check: single `@`, non-empty local part, domain containing a dot, no whitespace (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Names reject `/[\u0000-\u001f\u007f]/`. Error strings: `'Please enter your first name.'`, `'Please enter your last name.'`, `'Please enter a valid email address.'`, `'Please enter a message.'`, and `'Too long.'`-style messages for limits (exact wording free).
- [ ] **Step 4:** tests PASS; typecheck clean.
- [ ] **Step 5: Commit** — `feat: shared contact form validation`.

### Task 4: Contact page with fetch client

**Files:**
- Create: `src/lib/contactClient.ts`
- Modify: `src/pages/Contact.tsx`, `src/vite-env.d.ts` (declare `VITE_CONTACT_URL`)
- Test: `src/pages/Contact.test.tsx`

**Interfaces:**
- Consumes: `normalizeContact`, `validateContact`, `ContactInput`, `ContactErrors` from `shared/contact.ts`.
- Produces: `function getContactUrl(): string | undefined` (order: `import.meta.env.VITE_CONTACT_URL`, then `custom.contactUrl` from `amplify_outputs.json` loaded via `import.meta.glob('/amplify_outputs.json', { eager: true, import: 'default' })` so a missing file doesn't break the build); `async function submitContact(input: ContactInput): Promise<void>` — throws `ContactSubmitError` on missing URL, network failure, or non-2xx.

- [ ] **Step 1: Write failing tests** (mock `global.fetch` with `vi.fn`, stub `VITE_CONTACT_URL` via `vi.stubEnv`, render inside `MemoryRouter` with routes `/contact` and `/sent`):
  - `shows field errors and does not submit when empty` → click Send → 4 `.invalid-feedback` messages, `fetch` not called
  - `submits trimmed payload and navigates to /sent` → fill fields, Send → `fetch` called once with URL, `method: 'POST'`, `headers: {'content-type':'application/json'}`, body JSON `{firstName,lastName,email,message,company:''}`; then `Thank you for contacting us` visible
  - `disables submit while sending` → fetch returns a pending promise; click Send twice → button disabled, text `Sending…`, `fetch` called once
  - `shows error on network failure` → fetch rejects → `role="alert"` visible containing `try again`; still on contact page
  - `shows error on non-JSON 502` → fetch resolves `new Response('<html>', {status: 502})` → alert visible
  - `shows error when no endpoint configured` → `vi.stubEnv('VITE_CONTACT_URL', '')` → alert on submit, fetch not called
  - `honeypot field is hidden from users` → input named `company` has `tabIndex -1`, `autoComplete="off"`, and is inside an `aria-hidden` wrapper
- [ ] **Step 2:** `npm test -- Contact` → FAIL.
- [ ] **Step 3: Implement `contactClient.ts`** per Interfaces.
- [ ] **Step 4: Implement `Contact.tsx`.** Keep the old markup/classes/labels/placeholders (`div.controls > div.row > div.col-md-6 > div.form-group` spacer, `div.container > div.center > form.contact-form`, `div.form-group > label + input.form-control`, textarea rows 3, `button.btn.btn-primary.d-inline-block` "Send"); add `noValidate`, `htmlFor`/`id` pairs, `type="email"` on email, `is-invalid` + `div.invalid-feedback` per field, `div.alert.alert-danger[role=alert]` above the button on error with text `Sorry, your message couldn't be sent. Please try again later.`; honeypot wrapper `div[aria-hidden][style=position:absolute;left:-10000px]`. On success `navigate('/sent')`.
- [ ] **Step 5:** `npm test` → PASS; lint/typecheck/build clean. Desktop screenshot of `/contact` still matches baseline.
- [ ] **Step 6: Commit** — `feat: rebuild contact form with validation and API submission`.

### Task 5: Amplify Gen 2 backend — contact Lambda + SES

**Files:**
- Create: `amplify/backend.ts`, `amplify/functions/contact/resource.ts`, `amplify/functions/contact/handler.ts`, `amplify/package.json` (`{"type":"module"}`), `amplify/tsconfig.json` (Gen 2 default: `strict`, `module es2022`, `moduleResolution bundler`, `paths: {"$amplify/*": ["../.amplify/generated/*"]}`)
- Test: `amplify/functions/contact/handler.test.ts`
- Modify: `package.json` (devDeps), `vite.config.ts` (`test.include` covers `amplify/**/*.test.ts`), `eslint.config.js` if needed

**Interfaces:**
- Consumes: `normalizeContact`, `validateContact`, `LIMITS` from `shared/contact.ts` (relative import `../../../shared/contact`).
- Produces: `handler(event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult>`; output `custom.contactUrl` in `amplify_outputs.json`.

- [ ] **Step 1:** `npm i -D @aws-amplify/backend@^1.25.1 @aws-amplify/backend-cli@^1.10.0 aws-cdk-lib@^2.275.0 constructs@^10.8.1 @aws-sdk/client-sesv2 @types/aws-lambda esbuild tsx`. Expected: no peer errors.
- [ ] **Step 2: Write failing tests** (mock `@aws-sdk/client-sesv2` with `vi.mock`, capture `SendEmailCommand` input; set env `CONTACT_FROM_EMAIL=from@example.com`, `CONTACT_TO_EMAIL=to@example.com`):
  - `sends a valid message` → 200; SES called once with `FromEmailAddress 'from@example.com'`, `Destination.ToAddresses ['to@example.com']`, `ReplyToAddresses [visitor email]`, `Content.Simple.Subject.Data 'New contact form message from Jane Doe'`, body text containing name, email and message
  - `rejects non-POST` → `GET` → 405, SES not called
  - `rejects invalid JSON` → body `'{'` → 400
  - `rejects oversized bodies` → body of `LIMITS.bodyBytes + 1` bytes → 413
  - `returns field errors` → missing email → 400, JSON body `{ errors: { email: … } }`
  - `drops honeypot submissions` → `company: 'Acme'` → 200, SES not called
  - `decodes base64 bodies` → `isBase64Encoded: true` with base64 JSON of a valid payload → 200, SES called
  - `returns 502 when SES fails` → SES send rejects → 502, body `{ error: 'Unable to send message' }` (no SES error text)
  - `returns 500 when env is missing` → unset `CONTACT_TO_EMAIL` → 500, SES not called
- [ ] **Step 3:** `npx vitest run amplify` → FAIL.
- [ ] **Step 4: Implement `handler.ts`.** Read `event.requestContext.http.method`; responses are JSON with `content-type: application/json` (CORS headers come from the Function URL config, not the handler). Instantiate `SESv2Client` once at module scope. Log SES failures with `console.error` (no PII beyond the error).
- [ ] **Step 5:** tests PASS.
- [ ] **Step 6: Implement `resource.ts`:** `defineFunction({ name: 'contact', entry: './handler.ts', timeoutSeconds: 10, runtime: 22, environment: { CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL ?? '', CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL ?? '' } })`.
- [ ] **Step 7: Implement `backend.ts`:** `const backend = defineBackend({ contact })`; `const fn = backend.contact.resources.lambda`; `fn.addFunctionUrl({ authType: FunctionUrlAuthType.NONE, cors: { allowedOrigins: origins, allowedMethods: [HttpMethod.POST], allowedHeaders: ['content-type'], maxAge: Duration.hours(1) } })` where `origins` = `CONTACT_ALLOWED_ORIGINS` split on commas, defaulting to `['*']` only when unset; set `(fn.node.defaultChild as CfnFunction).reservedConcurrentExecutions = 2`; add `PolicyStatement({ actions: ['ses:SendEmail'], resources: [identity ARNs for the from-address and its domain: arn:aws:ses:${Stack.of(fn).region}:${Stack.of(fn).account}:identity/<value>] })`, falling back to `identity/*` when `CONTACT_FROM_EMAIL` is unset; `backend.addOutput({ custom: { contactUrl: url.url } })`.
- [ ] **Step 8:** `npx tsc -p amplify --noEmit` clean; `npx ampx sandbox --once` succeeds **if** AWS credentials are available locally (skip otherwise, and note it in the commit message). `npm test`, `npm run build` still green.
- [ ] **Step 9: Commit** — `feat: Amplify Gen 2 contact Lambda sending via SES`.

### Task 6: Amplify build config and README

**Files:**
- Create: `amplify.yml`
- Rewrite: `README.md`

- [ ] **Step 1: `amplify.yml`:**
  ```yaml
  version: 1
  backend:
    phases:
      preBuild:
        commands:
          - nvm install 24 && nvm use 24
          - npm ci --cache .npm --prefer-offline
      build:
        commands:
          - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
  frontend:
    phases:
      preBuild:
        commands:
          - nvm use 24
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: dist
      files:
        - '**/*'
    cache:
      paths:
        - .npm/**/*
        - node_modules/**/*
  ```
- [ ] **Step 2: README** sections: Overview, Requirements (Node ≥ 22.22), Scripts table, Project layout, Contact form architecture (one paragraph), **Deploying on Amplify** checklist from spec §6 (SES verification incl. sandbox note, the three env vars, service role `AmplifyBackendDeployFullAccess`, SPA rewrite rule copied verbatim from the spec), Local contact testing (`VITE_CONTACT_URL` or `npx ampx sandbox`).
- [ ] **Step 3:** `npx --yes yaml-lint amplify.yml` (or parse with `node -e`) → valid.
- [ ] **Step 4: Commit** — `chore: Amplify build config and README`.

### Task 7: Final verification

- [ ] **Step 1:** `npm ci && npm run lint && npm run typecheck && npm test && npm run build` → all clean. Report `dist/` JS/CSS gzip sizes and `npm ls --omit=dev --depth=0`.
- [ ] **Step 2:** `npx vite preview`; screenshot all 7 routes at 1440×900 and 375×812; put desktop pairs (baseline vs new) side by side and confirm parity; confirm mobile checks from Task 2 Step 6.
- [ ] **Step 3:** In preview, load `/about` directly (deep link) → page renders (Amplify needs the rewrite rule for the same in prod; README covers it).
- [ ] **Step 4:** Summarize for the user: what changed, what the console steps are, what could not be verified (real SES delivery until env + identity are set).
