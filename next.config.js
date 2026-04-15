/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**.unsplash.com', pathname: '/**' },
    ],
  },

  // This is the most important addition for your current Prisma + build issues
  experimental: {
    staticGenerationMaxConcurrency: 1,   // Prevents too many parallel DB connections during build
  },
}

module.exports = nextConfig