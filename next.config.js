const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable static optimization for dashboard to avoid manifest issues
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

module.exports = withNextIntl(nextConfig);

