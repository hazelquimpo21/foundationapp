/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Server Actions are stable in Next.js 14
  },
  // Log build info
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig
