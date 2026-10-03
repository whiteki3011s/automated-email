/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["bullmq", "ioredis", "nodemailer"]
  }
};

export default nextConfig;
