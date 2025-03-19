/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... outras configurações existentes
  transpilePackages: ['react-window'],
  webpack: (config) => {
    // Adiciona suporte para módulos que precisam de window
    config.resolve.fallback = {
      ...config.resolve.fallback,
      window: false,
    };
    return config;
  },
};

module.exports = nextConfig; 