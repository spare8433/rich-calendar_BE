import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import dayjs from "dayjs";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({ email: z.string().email(), code: z.string().length(6) });

// 비밀번호 재설정 인증 코드 검증
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({ select: { id: true }, where: { email: requestBody.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // email code 검증
    const verifiedCode = await prisma.passwordCode.findFirst({
      select: { id: true },
      where: {
        userId: user.id,
        code: requestBody.code,
        createdAt: { gt: dayjs().subtract(30, "minute").toISOString() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!verifiedCode) return NextResponse.json({ success: false }, { status: 200 });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
