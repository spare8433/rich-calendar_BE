import apiHandler from "@/lib/apiHandler";
import authenticate from "@/lib/authenticate";
import { prisma } from "@/lib/prisma-client";
import { NextResponse } from "next/server";

// 사용자 스케줄 목록 조회
export function GET() {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // 사용자 스케줄 목록 조회 쿼리
    const tags = await prisma.tag.findMany({ select: { id: true, title: true }, where: { userId: user.id } });

    return NextResponse.json({ tags }, { status: 200 });
  });
}
