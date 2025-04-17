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
      "res.cloudinary.com",
      "image.tmdb.org",
      "example.com",
      "beam-images.warnermediacdn.com",
      "images.squarespace-cdn.com",
      "m.media-amazon.com",
      "s3.amazonaws.com",
      "mediaproxy.tvtropes.org",
    ],
  },
};

export default nextConfig;
