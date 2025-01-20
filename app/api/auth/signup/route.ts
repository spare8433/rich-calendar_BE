import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";

const requestSchema = z.object({
  username: z.string().min(5).max(20),
  email: z.string().email(),
  password: z.string().min(9).max(32),
});

export async function POST(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // user 중복 확인
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: requestBody.username }, { email: requestBody.email }] },
    });
    if (user) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // password 암호화
    const hashedPassword = await bcrypt.hash(requestBody.password, 10);

    // user 생성
    await prisma.user.create({ data: { ...requestBody, password: hashedPassword } });
    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
