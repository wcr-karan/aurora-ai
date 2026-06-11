import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mammoth / unpdf rely on Node built-ins; keep them out of the bundler.
  serverExternalPackages: ["mammoth", "unpdf", "bcryptjs"],
  eslint: {
    // Linting is run separately; never let it block a production build.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // The embeddable widget must be loadable cross-origin from any site.
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
        ],
      },
      {
        source: "/api/widget/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
