import apiHandler from "@/lib/apiHandler";
import authenticate from "@/lib/authenticate";
import { prisma } from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 사용자 스케줄 태그 목록 조회
export function GET() {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // 사용자 스케줄 목록 조회 쿼리
    const tags = await prisma.tag.findMany({ select: { id: true, title: true }, where: { userId: user.id } });

    return NextResponse.json({ tags }, { status: 200 });
  });
}

const createTagSchema = z.object({ title: z.string() });

// 사용자 스케줄 태그 생성
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // request 검증
    const { success, data: requestBody } = createTagSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 태그 조회
    const tag = await prisma.tag.findFirst({
      select: { id: true },
      where: { userId: user.id, title: requestBody.title },
    });
    if (tag) return NextResponse.json({ error: "Conflict" }, { status: 409 });

    // 태그 생성
    await prisma.tag.create({ data: { ...requestBody, userId: user.id } });

    return NextResponse.json("ok", { status: 200 });
  });
}
