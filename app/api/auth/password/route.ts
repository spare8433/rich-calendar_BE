import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import bcrypt from "bcrypt";

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(9).max(32),
});

export async function PATCH(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({ where: { email: requestBody.email } });
    if (!user) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

    // 사용자 비밀번호 변경
    const hashedPassword = await bcrypt.hash(requestBody.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
