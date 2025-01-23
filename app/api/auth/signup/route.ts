import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({
  username: z.string().min(5).max(20),
  email: z.string().email(),
  password: z.string().min(9).max(32),
});

// 회원가입
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // user 중복 확인
    const user = await prisma.user.findFirst({
      select: { id: true },
      where: { OR: [{ username: requestBody.username }, { email: requestBody.email }] },
    });
    if (user) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(requestBody.password, 10); // password 암호화

    // user 생성
    await prisma.user.create({ data: { ...requestBody, password: hashedPassword } });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  });
}
