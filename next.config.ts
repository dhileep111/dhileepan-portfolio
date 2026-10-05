import type { NextConfig } from "next";

// For GitHub Pages project sites the app is served from /<repo>; the deploy
// workflow sets NEXT_PUBLIC_BASE_PATH. Leave empty for a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // static HTML into ./out (GitHub Pages)
  basePath: basePath || undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  images: { unoptimized: true }, // no image server on static hosting
};

export default nextConfig;
