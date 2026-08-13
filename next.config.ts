import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — oddiy nginx bilan servlanadi, Node server kerak emas
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
