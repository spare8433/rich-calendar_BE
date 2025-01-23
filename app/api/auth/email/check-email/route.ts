import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({ email: z.string().email() });

// email 중복 확인
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 중복 확인
    const user = await prisma.user.findUnique({ select: { id: true }, where: { email: requestBody.email } });
    if (user) return NextResponse.json({ available: false }, { status: 200 });

    return NextResponse.json({ available: true }, { status: 200 });
  });
}
