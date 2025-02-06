import type { NextConfig } from "next";
import { env } from "process";

const allowedOrigin = env.ALLOWED_ORIGIN || "";

const BASIC_HEADERS = [
  {
    key: "Access-Control-Allow-Origin",
    value: allowedOrigin,
  },
  {
    key: "Access-Control-Allow-Methods",
    value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          ...BASIC_HEADERS,
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: BASIC_HEADERS,
      },
      {
        source: "/api/auth/login",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          ...BASIC_HEADERS,
        ],
      },
    ];
  },
};

export default nextConfig;
