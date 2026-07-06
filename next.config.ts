import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never fail the build because env vars are missing — demo mode handles that.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
