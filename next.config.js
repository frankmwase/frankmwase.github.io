/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Preserve CNAME for GitHub Pages custom domain
  // The CNAME file in public/ will be copied to out/ on build
};

module.exports = nextConfig;
