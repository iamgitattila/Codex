/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable incremental static regeneration
  experimental: {
    incrementalCacheHandlerPath: undefined,
  },

  // Rewrites for dynamic city pages
  async rewrites() {
    return [
      {
        source: '/:state/:city',
        destination: '/city/:state/:city',
      },
      {
        source: '/:state/:city/:page',
        destination: '/city/:state/:city/:page',
      },
    ];
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Images optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://homeowner.wiki',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
