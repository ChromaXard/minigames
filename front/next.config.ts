import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [process.env.ALLOWED_DEV_ORIGINS || "dev.akastler.fr", "api.dev.akastler.fr"],
  reactStrictMode: true,
};

export default nextConfig;
