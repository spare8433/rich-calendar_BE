import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";

const requestSchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({ where: { email: requestBody.email } });
    if (!user) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    return NextResponse.json({ success: true, username: user.username, createdAt: user.createdAt }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
