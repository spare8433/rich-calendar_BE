import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";

const requestSchema = z.object({ username: z.string().min(5).max(20) });

export async function POST(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // username 기준 user 중복 확인
    const user = await prisma.user.findUnique({ where: { username: requestBody.username } });
    if (user) return NextResponse.json({ available: false }, { status: 200 });

    return NextResponse.json({ available: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
