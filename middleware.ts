import { NextResponse } from "next/server";
import { env } from "process";

export function middleware() {
  const res = NextResponse.next();

  const allowedOrigin = env.ALLOWED_ORIGIN || "";

  // CORS 설정
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}

// 특정 경로에만 적용 (예: /api/*)
export const config = {
  matcher: "/api/:path*",
};
