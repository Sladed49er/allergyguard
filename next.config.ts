import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid issues with generated Prisma files
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checking enabled
    ignoreBuildErrors: false,
  },
  // Move outputFileTracingExcludes out of experimental
  outputFileTracingExcludes: {
    '*': ['./app/generated/**/*'],
  },
}

export default nextConfig
