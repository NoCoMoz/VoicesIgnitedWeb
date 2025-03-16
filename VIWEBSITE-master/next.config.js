/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    domains: ['cdn.bsky.app'], // Allow images from Bluesky CDN
    unoptimized: false,
  },
  trailingSlash: true,
}

module.exports = nextConfig
