import type { NextConfig } from "next";

const isExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["graphql"],
  },
  ...(isExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        basePath: basePath || undefined,
      }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
