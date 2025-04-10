import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "upload.wikimedia.org",
      "uhdtv.io",
      "mango.blender.org",
      "download.blender.org",
      "www.cartoonbrew.com",
      "commondatastorage.googleapis.com",
    ],
  },
};

export default nextConfig;
