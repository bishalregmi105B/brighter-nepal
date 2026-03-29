/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output — produces a self-contained build that doesn't need
  // the full node_modules at runtime.
  output: 'standalone',

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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    return config
  },
  // Enable gzip compression at framework level
  compress: true,
}

export default nextConfig
