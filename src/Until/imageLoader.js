// Image loader for next/image. It asks each image host for the width the browser needs (next/image picks it
// from `sizes`) in a modern format, instead of downloading every photo at full size. No image server is needed,
// so it works wherever the site is hosted.
export default function imageLoader({ src, width, quality }) {
  // Unsplash runs on imgix, so their CDN resizes the photo and serves WebP or AVIF.
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 70));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }
  // App Store screenshots (mzstatic) carry the size in the path.
  if (src.includes("mzstatic.com/image/thumb/")) {
    return src.replace(/\/\d+x\d+bb\.(webp|jpg|png)$/, `/${width}x0w.webp`);
  }
  // Our own files are served as they are. The width only changes the cache key.
  if (src.startsWith("/")) return `${src}?w=${width}`;
  // Anything else, such as a signed upload link, is left unchanged, because adding parameters could break the signature.
  return src;
}
