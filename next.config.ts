import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev', 'placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-772fe1edccf84caaaad1cc92ef203d50.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
