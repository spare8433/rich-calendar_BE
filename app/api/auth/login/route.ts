import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { generateToken } from "@/lib/jwt";
import { z } from "zod";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({ username: z.string().min(5).max(20), password: z.string().min(9).max(32) });

// 로그인
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // user 확인
    const user = await prisma.user.findUnique({
      select: { id: true, password: true },
      where: { username: requestBody.username },
    });
    if (!user) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    // 비밀번호 일치여부 확인
    const isPasswordValid = await bcrypt.compare(requestBody.password, user.password);
    if (!isPasswordValid) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const token = generateToken(user.id); // jwt 토큰 발급

    const response = NextResponse.json("ok", { status: 200 });

    response.cookies.set("token", token, {
      domain: process.env.COOKIE_DOMAIN ?? "sss",
      httpOnly: true, // JavaScript에서 접근 불가
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "none",
      maxAge: 60 * 60, // 1시간
      path: "/",
    });

    return response;
  });
}
