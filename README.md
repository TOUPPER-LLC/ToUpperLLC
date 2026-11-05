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
| `npm run build`     | Type-check and build the site into `dist/`        |
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
  pages/                 One component per route (each sets its own <title>)
  content/services.ts    Service descriptions used on Home and Services
  content/work.ts        Projects shown on Our work (add new projects here)
  lib/contactClient.ts   Sends the contact form to the backend
  styles/site.css        Theme (colors, type) and page styles, loaded after Bootstrap
shared/contact.ts        Contact validation used by both the browser and the Lambda
amplify/                 Amplify Gen 2 backend (contact Lambda, Function URL, SES access)
amplify.yml              Amplify Hosting build settings
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

## Deploying on Amplify

Amplify Hosting runs `amplify.yml`: it deploys the backend (`ampx pipeline-deploy`), which
writes `amplify_outputs.json`, then builds the site. One-time setup in the AWS console:

1. **Set environment variables** (Amplify → Hosting → Environment variables), then redeploy.
   They are read at deploy time, so changing one always needs a redeploy.

   | Variable                  | Value |
   | ------------------------- | ----- |
   | `CONTACT_TO_EMAIL`        | The inbox that should receive messages (Gmail is fine). |
   | `CONTACT_ALLOWED_ORIGINS` | Every URL the site is served from, comma-separated, `https://`, no trailing slash, e.g. `https://master.<appid>.amplifyapp.com,https://yourdomain.com,https://www.yourdomain.com`. The `amplifyapp.com` URL is on the app's Overview page. If empty, any origin is accepted. |
   | `CONTACT_FROM_EMAIL`      | Optional. Leave it out to use SNS. Set it to an address on your own domain to switch to SES. Don't use a Gmail/Hotmail address here: mail claiming to be from those providers but sent by AWS is treated as spoofed. |

2. **Confirm delivery:**
   - **SNS mode:** after the first deploy, `CONTACT_TO_EMAIL` receives an "AWS Notification -
     Subscription Confirmation" email. Click **Confirm subscription** (check spam). Messages
     sent before you confirm are not delivered.
   - **SES mode:** verify your domain in SES (same region as the Amplify app) by adding the DKIM
     records it gives you to DNS, and verify the receiving address too: new SES accounts are in a
     *sandbox* that can only send to verified addresses. Production access is not needed.
3. **Service role:** the app needs a service role that can deploy Gen 2 backends
   (Amplify → App settings → IAM roles, with the `AmplifyBackendDeployFullAccess` managed policy).
4. **SPA rewrite rule** (Amplify → Hosting → Rewrites and redirects) so deep links like `/about` load:

   | Source address | Target address | Type |
   | -------------- | -------------- | ---- |
   | `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

   In the console, enter the source without the backslashes (they're only escaping the table pipes here).

The Lambda reserves 2 concurrent executions to cap abuse. If the deploy fails with an error about
unreserved concurrency (some new accounts have a total limit of 10), request a higher Lambda
concurrency quota or remove the `reservedConcurrentExecutions` line in `amplify/backend.ts`.

## Testing the contact form locally

The site reads the endpoint from `VITE_CONTACT_URL` first, then from `amplify_outputs.json`.

- Against a deployed backend: put `VITE_CONTACT_URL=<function url>` in `.env.local` and run `npm run dev`.
- With your own cloud sandbox (needs AWS credentials): `CONTACT_TO_EMAIL=… npx ampx sandbox`,
  which writes `amplify_outputs.json` for the dev server.

Without either, the form shows its "couldn't be sent" message.
