/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-service:8080/:path*'
      }
    ]
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  images: {
    domains: ['54.208.12.34'],
  },
  // Handle environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://54.208.12.34/api',
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://54.208.12.34/api',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://54.208.12.34'
  },
  // Add page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
  // Add React strict mode
  reactStrictMode: true,
  // For handling the audio recording feature
  experimental: {
    serverActions: true,
  },
  // CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  }
}

module.exports = nextConfig