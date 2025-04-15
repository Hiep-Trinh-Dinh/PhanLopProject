/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60, // Cache hình ảnh tối thiểu 60 giây
    formats: ["image/avif", "image/webp"], // Sử dụng định dạng hiện đại

  },
};

export default nextConfig;