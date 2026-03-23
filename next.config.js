const { node } = require('prop-types')

const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
module.exports = removeImports({
  // reactStrictMode: true,
  env: {
    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
  },
  staticPageGenerationTimeout: 240,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: false
    // optimizePackageImports: ['antd', 'react-apexcharts']
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      }
    ]
  },
})
