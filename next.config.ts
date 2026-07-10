import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never fail the build because env vars are missing — demo mode handles that.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // Coralux demo villa photography
      { protocol: "https", hostname: "images.unsplash.com" },
      // Guesty listing photos (Coralux villas)
      { protocol: "https", hostname: "assets.guesty.com" },
      { protocol: "https", hostname: "**.guesty.com" },
      { protocol: "https", hostname: "guesty-listing-images.s3.amazonaws.com" },
    ],
  },
};

export default nextConfig;
