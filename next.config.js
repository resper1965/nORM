const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Force Node.js runtime for middleware to avoid Edge Runtime issues with Supabase
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
};

module.exports = withNextIntl(nextConfig);

