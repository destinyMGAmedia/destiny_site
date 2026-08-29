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

  // @react-pdf/renderer -> pdfkit loads its standard-font metrics via a *computed*
  // require() (`./standard-fonts/${name}.cjs`), which Next's serverless file-tracing
  // can't follow — so the résumé PDF route crashes on Vercel with
  // "Cannot find module '.../pdfkit/js/standard-fonts/Helvetica.cjs'".
  // Externalise the package and force-include pdfkit/fontkit assets in the lambda.
  serverExternalPackages: ['@react-pdf/renderer', 'unpdf', 'mammoth'],
  outputFileTracingIncludes: {
    '/api/yellowpages/listings/[id]/resume': [
      './node_modules/pdfkit/js/**/*',
      './node_modules/fontkit/**/*',
    ],
    '/api/**/*': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    // unpdf bundles a serverless pdfjs build; make sure its worker/cmaps assets ship.
    '/api/yellowpages/resume/import': ['./node_modules/unpdf/dist/**/*'],
  },
}

module.exports = nextConfig