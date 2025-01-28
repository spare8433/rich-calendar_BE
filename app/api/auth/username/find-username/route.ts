import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({ email: z.string().email() });

// username 찾기
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({
      select: { username: true, createdAt: true },
      where: { email: requestBody.email },
    });
    if (!user) return NextResponse.json({ success: false }, { status: 200 });

    return NextResponse.json({ success: true, ...user }, { status: 200 });
  });
}
