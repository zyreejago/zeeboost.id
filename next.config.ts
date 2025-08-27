const nextConfig = {
  images: {
    domains: ['tr.rbxcdn.com', 'zeeboost.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'zeeboost.com',
        pathname: '/uploads/**',
      },
    ],
    // Tambahkan untuk production
    unoptimized: process.env.NODE_ENV === 'production',
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Tambahkan static file serving untuk uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://www.googletagmanager.com https://googleads.g.doubleclick.net;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
              img-src 'self' data: http: https: blob: https://zeeboost.com;
              connect-src 'self' https://www.google.com https://www.recaptcha.net https://www.googletagmanager.com https://googleads.g.doubleclick.net;
              frame-src 'self' https://www.google.com https://www.recaptcha.net https://www.googletagmanager.com;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

export default nextConfig;
