/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Rewrites allow proxying API requests
  async rewrites() {
    return [
      {
        source: "/api/:path*", // All API requests starting with /api
        destination:
          "https://ec2-13-60-183-49.eu-north-1.compute.amazonaws.com/api/:path*", // The backend server URL
      },
    ];
  },
  // Optional: You can add custom headers or other configurations if needed
  async headers() {
    return [
      {
        source: "/api/:path*", // Apply to all API routes
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allow cross-origin requests
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS, PUT, DELETE", // Allow these HTTP methods
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Origin, Content-Type, Authorization, X-Requested-With", // Allow these headers
          },
        ],
      },
    ];
  },
};

export default nextConfig;
