import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Anti-Clickjacking: Disallow any framing of the application
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none';",
  },
  // 2. Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 3. Referrer privacy policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 4. Permissions policy (Restrict hardware/sensor access)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // 5. HTTP Strict Transport Security (HSTS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // 6. XSS filter protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // 7. DNS Prefetch Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable X-Powered-By header to prevent technology fingerprinting
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
