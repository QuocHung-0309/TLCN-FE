// next.config.ts
import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "onetour.vn", pathname: "/Media/**" },
      { protocol: "https", hostname: "motogo.vn", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "cdn3.ivivu.com", pathname: "/**" },
      { protocol: "https", hostname: "bazaarvietnam.vn", pathname: "/**" },
      { protocol: "https", hostname: "mia.vn", pathname: "/**" },
      { protocol: "https", hostname: "dulichviet.com.vn", pathname: "/**" },
      { protocol: "https", hostname: "condao.com.vn", pathname: "/**" },
      { protocol: "https", hostname: "rootytrip.com", pathname: "/**" },
      { protocol: "https", hostname: "vcdn1-dulich.vnecdn.net", pathname: "/**" },
      { protocol: "https", hostname: "static.vinwonders.com", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE}/api/:path*`,
      },
    ];
  },
};
  
export default nextConfig;