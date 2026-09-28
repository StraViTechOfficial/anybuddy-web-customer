// Image loader for next/image. Asks each image host for the width the browser needs (next/image picks it
// from `sizes`), in a modern format, instead of downloading every photo at full size. No image server needed,
// so it works wherever the site is hosted.
export default function imageLoader({ src, width, quality }) {
  // Unsplash (imgix): resize + webp/avif on their CDN.
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 70));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }
  // App Store screenshots (mzstatic): the size is part of the path.
  if (src.includes("mzstatic.com/image/thumb/")) {
    return src.replace(/\/\d+x\d+bb\.(webp|jpg|png)$/, `/${width}x0w.webp`);
  }
  // Our own files: served as they are (the width only varies the cache key).
  if (src.startsWith("/")) return `${src}?w=${width}`;
  // Anything else (e.g. signed upload links): unchanged — adding parameters could break the signature.
  return src;
}
