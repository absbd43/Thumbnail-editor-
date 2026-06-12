import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Designs and logos are stored as base64 data URLs, so API payloads can be large.
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // Standalone output makes Hostinger VPS / Node.js deployment simple (node .next/standalone/server.js)
  output: "standalone",
};

export default nextConfig;
