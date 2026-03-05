/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@dojodash/core',
    '@dojodash/firebase',
    '@dojodash/ui',
    '@dojodash/club',
  ],
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@tabler/icons-react'],
  },
};

module.exports = nextConfig;
