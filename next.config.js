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

  // Pin file-tracing to this project dir so Vercel's build doesn't double the
  // path (/vercel/path0/vercel/path0) and fail to write *.nft.json trace files.
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig