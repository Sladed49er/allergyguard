/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid issues with generated Prisma files
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also skip type checking during builds if needed
    ignoreBuildErrors: false,
  },
  // Exclude problematic directories from the build process
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./app/generated/**/*'],
    },
  },
}

module.exports = nextConfig