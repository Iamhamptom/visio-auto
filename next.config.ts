import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/pricing/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
