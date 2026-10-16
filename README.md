# AnyBuddy customer website

The customer-facing AnyBuddy website: browse home services, pick a local pro, book a time and pay.
Built with Next.js 16 (16.3.8, App Router) and React 19 in plain JavaScript. All data comes from the AnyBuddy API, which
the browser reaches only through this site's `/api` proxy (`BACKEND_URL`); this app has no database of its own.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Environment variables

Put these in `.env.local` (never commit it). Values come from the hosting dashboard.

| Name | Used for |
| --- | --- |
| `BACKEND_URL` | Base URL of the AnyBuddy API, server-only (production: `https://api-prod.any-buddy.com/api`). Required; there is no default |
| `PROXY_SHARED_SECRET` | Same value as the backend's. With it, the proxy passes on the visitor's IP address (rate limits, Stripe terms) |
| `NEXT_PUBLIC_PRO_URL` | Buddy (provider) website; defaults to `https://pro.any-buddy.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Places address search (browser key, restrict by domain) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe card form |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth (Google / Apple sign-in; `NEXTAUTH_URL` is read by NextAuth itself) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in (switched on only when both are set) |
| `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Sign in with Apple (switched on only when all four are set; the client secret is signed from the key at start-up) |

## Layout

- `src/proxy.js` — Next 16 proxy (formerly middleware): sends signed-out visitors from `/profile`, `/booking` and
  `/notification` to `/login` and marks those pages `no-store`.
- `src/app/api/[...path]/route.js` — the API proxy. It forwards an allow-list of customer API paths to `BACKEND_URL`
  and keeps the login token in httpOnly cookies.
- `src/app/` — routes (App Router). `(AfterLogin)`, `(BeforLogin)` and `(CommonPage)` are route groups.
- `src/Components/` — page sections, forms, header/footer.
- `src/api/` — API calls (`setting.js`) on top of axios helpers (`index.js`); `store/` holds shared state (zustand).
- `src/Until/` — helpers: cookies, HTML cleaning, image loader, validation messages.
- `archive/unused-public-assets/` — old images no longer used by the site, kept for reference (not served).

## Deployment

Hosted on Vercel, which deploys the production branch (currently `staging`; `main` after the move to the Any-Buddy
GitHub). Set the environment variables above in the Vercel project.

## Security notes

- HTML written in the admin panel (CMS pages, service descriptions) is cleaned with DOMPurify before it is shown:
  `src/Until/safeHtml.js`.
- The login token never reaches page scripts. The `/api` proxy keeps it in the httpOnly `ab_session` cookie (and the
  code-step token in `ab_code`, 15 minutes). Pages read only `ab_signed_in=1`, which holds no secret. Other cookies
  set by page scripts go through `src/Until/cookies.js`: `Secure` in production, `SameSite=Lax`. NextAuth sets its own
  sign-in cookies (`src/app/api/auth/[...nextauth]/route.js`).
- Security headers (a Content Security Policy with an allow-list of hosts, no framing, `nosniff`, strict referrer) are
  set for every page in `next.config.mjs`. A new third-party script, image host or frame must be added to the policy there.
