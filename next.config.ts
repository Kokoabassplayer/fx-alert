import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;