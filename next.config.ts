import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ⬇️ Disable the strict typed-routes checker
    typedRoutes: false,
  },

  /* any other options you need */
};

export default nextConfig;
