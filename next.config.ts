const nextConfig = {
  /* config options here */
  images: {
    domains: ['tr.rbxcdn.com'],
  },
  typescript: {
    ignoreBuildErrors: true,  // Mengabaikan error TypeScript saat build
  },
  eslint: {
    ignoreDuringBuilds: true,  // Mengabaikan error ESLint saat build
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
              img-src 'self' data: https:;
              connect-src 'self' https://www.google.com https://www.recaptcha.net;
              frame-src 'self' https://www.google.com https://www.recaptcha.net;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

export default nextConfig;
