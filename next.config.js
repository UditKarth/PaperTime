/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const repositoryName = process.env.REPOSITORY_NAME || 'PaperTime';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProduction ? `/${repositoryName}` : '',
  assetPrefix: isProduction ? `/${repositoryName}` : '',
  trailingSlash: true,
};

module.exports = nextConfig;

