import path from "node:path";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Security headers applied to every response.
 *
 * HSTS is only emitted in production — sending it in local dev would pin
 * http://localhost to HTTPS in the browser and break it. The frame-ancestors CSP
 * plus X-Frame-Options stops the app (login especially) being iframed for
 * clickjacking. Learner content embeds YouTube via youtube-nocookie.com, so that
 * host is allowed as a frame source.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; frame-src 'self' https://www.youtube-nocookie.com;",
  },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // Pin the root explicitly. Turbopack infers it from the nearest lockfile, and a
  // stray package-lock.json in the home directory otherwise wins and makes it
  // resolve modules from outside this project.
  turbopack: {
    root: path.join(__dirname),
  },
  // Don't advertise the framework version to attackers.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
