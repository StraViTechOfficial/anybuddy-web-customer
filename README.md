# AnyBuddy customer website

The customer-facing AnyBuddy website: browse home services, pick a local pro, book a time and pay.
Built with Next.js 15 (App Router) in plain JavaScript. All data comes from the AnyBuddy API
(`NEXT_PUBLIC_API_URL`); this app has no database of its own.

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
| `NEXT_PUBLIC_API_URL` | Base URL of the AnyBuddy API (ends with `/`) |
| `NEXT_PUBLIC_PRO_URL` | Buddy (provider) website; defaults to `https://pro.any-buddy.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Places address search (browser key, restrict by domain) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe card form |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth (Google / Apple sign-in) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Sign in with Apple |

## Layout

- `src/app/` — routes (App Router). `(AfterLogin)`, `(BeforLogin)` and `(CommonPage)` are route groups.
- `src/Components/` — page sections, forms, header/footer.
- `src/api/` — API calls (`setting.js`) on top of axios helpers (`index.js`); `store/` holds shared state (zustand).
- `src/Until/` — helpers: cookies, HTML cleaning, image loader, validation messages.
- `archive/unused-public-assets/` — old images no longer used by the site, kept for reference (not served).

## Deployment

Hosted on Vercel, deployed from the `staging` branch. Set the environment variables above in the Vercel project.

## Security notes

- HTML written in the admin panel (CMS pages, service descriptions) is cleaned with DOMPurify before it is shown:
  `src/Until/safeHtml.js`.
- Cookies are written only through `src/Until/cookies.js`: `Secure` in production, `SameSite=Lax`.
- Security headers (no framing, `nosniff`, strict referrer) are set for every page in `next.config.mjs`.
