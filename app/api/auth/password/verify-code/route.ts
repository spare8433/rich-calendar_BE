import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import dayjs from "dayjs";

const requestSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function PATCH(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({ where: { email: requestBody.email } });
    if (!user) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

    // email code 검증
    const verifiedCode = await prisma.passwordCode.findFirst({
      where: {
        userId: user.id,
        code: requestBody.code,
        createdAt: { gt: dayjs().subtract(30, "minute").toISOString() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!verifiedCode) return NextResponse.json({ success: false }, { status: 400 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
