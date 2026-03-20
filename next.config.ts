import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow remote images from google auth (used in stitch mockups)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // TypeScript strict checks already covered in tsconfig
}

export default nextConfig
