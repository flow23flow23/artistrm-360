/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub profile images
    ],
  },
  experimental: {
    // Enable if needed for specific features
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'ArtistRM 360',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}