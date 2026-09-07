/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@emotion/react', '@emotion/styled', '@mui/material'],
  distDir: '.next',

  experimental: {
    optimizeCss: true,
  },

  // Customize headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel.app; frame-ancestors 'none'"
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },

  // Configure redirects for cleaner URLs
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin',
        permanent: false,
      },
    ];
  },

  // Ensure API routes are handled correctly and enable optimizations
  experimental: {
    optimizeCss: true,
  },

  // Static export configuration for Vercel
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configure environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    IS_BUILD_TIME: process.env.IS_BUILD_TIME || (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ? 'true' : 'false'),
  },
}

module.exports = nextConfig