// Security headers on every page. Other sites can't put our pages in a frame (clickjacking), browsers don't guess
// file types, and full URLs are not leaked to other sites in the Referer header.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
