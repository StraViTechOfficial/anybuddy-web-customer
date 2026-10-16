// Content Security Policy. The browser loads scripts, frames, images and connections only from the hosts below, so a
// script injected into a page can't load more code or send data anywhere else. The API is not listed, because the
// browser reaches it only through this site's own /api proxy.
const S3 = "https://anybuddy-files-2026.s3.us-east-1.amazonaws.com https://s3.amazonaws.com/anybuddy-files-2026/";
const csp = [
  "default-src 'self'",
  // Next.js puts small inline scripts in every page, so 'unsafe-inline' is needed without nonces (and nonces would make
  // every page render on demand). Stripe.js runs the card form, and the Google Maps script powers the address search.
  // The dev server also needs eval for hot reload, so that is allowed in development only.
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  // React and Google's address suggestions set inline styles. Google Maps also loads its Roboto font stylesheet.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Photos come from our S3 bucket (Buddy photos and uploads), Unsplash (home page, category, service and booking
  // photos), Google accounts (profile photos of customers who signed in with Google), the App Store CDN (app
  // screenshots, which the image loader resizes on the same host), Google Maps (the "powered by Google" logo in address
  // search) and Stripe (card brand icons).
  `img-src 'self' data: blob: ${S3} https://images.unsplash.com https://lh3.googleusercontent.com https://is1-ssl.mzstatic.com https://maps.gstatic.com https://maps.googleapis.com https://*.stripe.com`,
  // Uploads go straight to S3 with a signed link. The ZIP lookup and address suggestions call Google, and Stripe.js
  // talks to Stripe's API.
  `connect-src 'self' ${S3} https://maps.googleapis.com https://places.googleapis.com https://api.stripe.com`,
  // Stripe's card form, its 3-D Secure bank check (hooks.stripe.com) and its fraud-signal frame (m.stripe.network).
  "frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.network",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Security headers on every page. Other sites can't put our pages in a frame (clickjacking), browsers don't guess
// file types, and full URLs are not leaked to other sites in the Referer header.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // jsdom (used for HTML cleaning on the server in src/Until/safeHtml.js) reads its own files at run time, so it must
  // stay unbundled.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  // Right-sized images from each host's CDN (see src/Until/imageLoader.js) instead of full-size originals.
  images: {
    loader: "custom",
    loaderFile: "./src/Until/imageLoader.js",
  },
};

export default nextConfig;
