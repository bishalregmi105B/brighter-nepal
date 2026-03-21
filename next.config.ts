import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow remote images from google auth
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // pdfjs-dist must be transpiled so webpack can handle its ESM correctly
  transpilePackages: ['pdfjs-dist'],
  // Alias canvas to false: pdfjs-dist tries to require('canvas') in browser
  // which causes "Object.defineProperty called on non-object" at bundle eval time
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    return config
  },
}

export default nextConfig
