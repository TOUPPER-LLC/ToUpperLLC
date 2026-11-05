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
  App.tsx                Routes (all pages share components/Layout.tsx)
  components/            Nav (mobile toggler), Footer, Layout, ProjectCard
  pages/                 One component per route
  lib/contactClient.ts   Sends the contact form to the backend
  styles/base.css        Site rules that load before Bootstrap
  styles/app.css         Site rules that load after Bootstrap + responsive rules
shared/contact.ts        Contact validation used by both the browser and the Lambda
amplify/                 Amplify Gen 2 backend (contact Lambda, Function URL, SES access)
amplify.yml              Amplify Hosting build settings
```

Styling is Bootstrap 4.6 (CSS only, no Bootstrap JavaScript) plus the two site stylesheets.

## How the contact form works

The form validates input in the browser with `shared/contact.ts`, then POSTs JSON to a
Lambda Function URL. The Lambda (`amplify/functions/contact/handler.ts`) validates again with
the same rules, ignores bot submissions (a hidden "honeypot" field), and sends the message
with SES to `CONTACT_TO_EMAIL`, from `CONTACT_FROM_EMAIL`, with the visitor's address as
Reply-To so you can answer directly. The Function URL is published to the site at build time
through `amplify_outputs.json`.

## Deploying on Amplify

Amplify Hosting runs `amplify.yml`: it deploys the backend (`ampx pipeline-deploy`), which
writes `amplify_outputs.json`, then builds the site. One-time setup in the AWS console:

1. **Verify an SES identity** in the same region as the Amplify app (SES → Identities):
   - Domain (recommended): add the DKIM CNAME records SES gives you to your DNS, or
   - Single address: click the verification link SES emails you.

   New SES accounts are in the *sandbox*, which can only send to verified identities. That is
   fine here because every message goes to your own verified inbox; production access is not needed.
2. **Set environment variables** (Amplify → App settings → Environment variables), then redeploy:

   | Variable                  | Example                                         |
   | ------------------------- | ----------------------------------------------- |
   | `CONTACT_FROM_EMAIL`      | `contact@yourdomain.com` (must be SES-verified) |
   | `CONTACT_TO_EMAIL`        | the inbox that should receive messages          |
   | `CONTACT_ALLOWED_ORIGINS` | `https://yourdomain.com,https://www.yourdomain.com,https://main.<appid>.amplifyapp.com` |

   If `CONTACT_ALLOWED_ORIGINS` is empty the endpoint accepts requests from any origin.
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
- With your own cloud sandbox (needs AWS credentials): `CONTACT_FROM_EMAIL=… CONTACT_TO_EMAIL=… npx ampx sandbox`,
  which writes `amplify_outputs.json` for the dev server.

Without either, the form shows its "couldn't be sent" message.
