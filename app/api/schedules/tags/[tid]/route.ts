import apiHandler from "@/lib/apiHandler";
import authenticate from "@/lib/authenticate";
import { prisma } from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const pathParamsSchema = z.object({ tid: z.coerce.number() });

const updateTagSchema = z.object({
  title: z.string(),
});

// 사용자 스케줄 태그 수정
export function PUT(request: NextRequest, { params }: { params: Promise<{ tid: number }> }) {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const parsedPathParams = pathParamsSchema.safeParse(await params);
    if (!parsedPathParams.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // request 검증
    const { success, data: requestBody } = updateTagSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 태그 조회
    const tag = await prisma.tag.findFirst({
      select: { id: true },
      where: { userId: user.id, id: parsedPathParams.data.tid },
    });
    if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 태그 업데이트
    await prisma.tag.update({ where: { id: parsedPathParams.data.tid }, data: { ...requestBody } });

    return NextResponse.json("ok", { status: 200 });
  });
}

// 사용자 스케줄 태그 삭제
export function DELETE(request: NextRequest, { params }: { params: Promise<{ tid: number }> }) {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const { success, data } = pathParamsSchema.safeParse(await params);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 태그 조회
    const tag = await prisma.tag.findFirst({ select: { id: true }, where: { userId: user.id, id: data.tid } });
    if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 태그 삭제
    await prisma.tag.delete({ where: { id: data.tid } });

    return NextResponse.json("ok", { status: 200 });
  });
}
