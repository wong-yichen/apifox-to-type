/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.apifox.cn'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://api.apifox.cn/api/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
