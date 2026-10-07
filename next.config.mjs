// Where /api and /uploads are proxied to. Defaults to the Docker service name;
// set BACKEND_URL=http://127.0.0.1:8000 for local development.
const BACKEND_URL = (process.env.BACKEND_URL || "http://backend:8000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // FastAPI list/create routes end in "/" (e.g. /api/contact/). Next's default
  // slash-stripping redirect would send those to /api/contact, which FastAPI
  // then redirects to its own internal host (http://backend:8000/...), which
  // browsers can't reach. Keep URLs exactly as requested.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // ":path*" drops a trailing slash, so match it explicitly first
        source: "/api/:path*/",
        destination: `${BACKEND_URL}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
