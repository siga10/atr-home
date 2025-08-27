/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ⛔ تجاهل أخطاء ESLint وقت الـ build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⛔ تجاهل أخطاء TypeScript وقت الـ build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
