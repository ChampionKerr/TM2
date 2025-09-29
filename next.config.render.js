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
  
  // Render-specific optimizations
  experimental: {
    optimizeCss: true,
    // Reduce memory usage on smaller Render instances
    workerThreads: false,
    cpus: 1,
  },

  // Output configuration for Render
  output: 'standalone',
  
  // Server configuration for Render (host/port binding)
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '10000'),
    // Render recommends these timeout settings for Node.js
    keepAliveTimeout: 120000,
    headersTimeout: 120000,
  },
  
  webpack: (config, { isServer, dev }) => {
    // Optimize webpack for Render deployment
    if (!isServer && !dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Memory optimization for Render
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },

  // Customize headers for security (Render handles HTTPS)
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.onrender.com"
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
        has: [
          {
            type: 'header',
            key: 'cookie',
            value: '(?!.*next-auth.session-token).*',
          },
        ],
      },
    ];
  },

  // Handle 404s gracefully
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: '/404',
        },
      ],
    };
  },

  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configure environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RENDER: process.env.RENDER || 'false',
  },

  // Image optimization for Render
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Server-side configuration
  serverRuntimeConfig: {
    // This will only be available on the server side
    mySecret: 'secret',
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    // This will be available on both server and client
    staticFolder: '/public',
  },
}

// Handle different environments
if (process.env.RENDER === 'true') {
  console.log('🚀 Building for Render deployment...');
  
  // Render-specific overrides
  nextConfig.compress = true;
  nextConfig.generateEtags = true;
  nextConfig.poweredByHeader = false;
}

module.exports = nextConfig