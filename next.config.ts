import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow verification builds to run alongside the development server.
  distDir: process.env.VOTING_BUILD_DIR || ".next",
};

export default nextConfig;
