const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Configuración adicional de webpack si es necesaria
    return config;
  },
  // Configuración para imágenes optimizadas
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Configuración de internacionalización
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/artists',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/integrations',
        destination: '/api',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
