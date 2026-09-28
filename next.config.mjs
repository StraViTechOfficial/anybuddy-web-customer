/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Right-sized images from each host's CDN (see src/Until/imageLoader.js) instead of full-size originals.
  images: {
    loader: "custom",
    loaderFile: "./src/Until/imageLoader.js",
  },
};

export default nextConfig;
