import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['udanlcylpsvxqlihcppb.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'udanlcylpsvxqlihcppb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
