import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import bcrypt from "bcrypt";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(9).max(32),
});

// 비밀번호 변경
export function PATCH(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색
    const user = await prisma.user.findUnique({ select: { id: true }, where: { email: requestBody.email } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 사용자 비밀번호 변경
    const hashedPassword = await bcrypt.hash(requestBody.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    return NextResponse.json("ok", { status: 200 });
  });
}
