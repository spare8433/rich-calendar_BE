import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import dayjs from "dayjs";
import generateCode from "@/lib/generateCode";
import sendGmail from "@/lib/mail";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({ email: z.string().email() });

// email 인증 코드 발송
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // email 기준 user 검색 (이미 사용 중인 email 확인)
    const user = await prisma.user.findUnique({ select: { id: true }, where: { email: requestBody.email } });
    if (user) return NextResponse.json({ error: "Conflict" }, { status: 409 });

    // 30분내 발급된 code 갯수 확인
    const recentCodeCount = await prisma.emailCode.count({
      where: { email: requestBody.email, createdAt: { gt: dayjs().subtract(30, "minute").toISOString() } },
    });
    if (recentCodeCount >= 3) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const generatedCode = generateCode(); // code 생성

    // 실제 email 로 코드 발송 부분
    sendGmail({
      to: requestBody.email,
      subject: "[리치캘린더] 인증코드 발송",
      text: "이메일 확인 인증코드: " + generatedCode,
    });

    // email 발송 후 code 저장
    await prisma.emailCode.create({
      data: {
        email: requestBody.email,
        code: generatedCode,
        expiresAt: dayjs().add(10, "minute").toISOString(),
      },
    });

    return NextResponse.json("ok", { status: 200 });
  });
}
