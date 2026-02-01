/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: true
  },
  
  // Configuration des images
  images: {
    domains: [],
    unoptimized: false
  }
}

module.exports = nextConfig
