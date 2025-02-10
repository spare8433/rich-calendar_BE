import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import { COLORS, IMPORTANCE_OPTIONS, REPEAT_FREQUENCY_OPTIONS } from "@/constants";
import authenticate from "@/lib/authenticate";
import apiHandler from "@/lib/apiHandler";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  importance: z.enum(IMPORTANCE_OPTIONS),
  color: z.enum(COLORS),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  tagIds: z.array(z.coerce.number()),
});

const repeatSchema = baseSchema.extend({
  isRepeat: z.literal(true),
  repeatFrequency: z.enum(REPEAT_FREQUENCY_OPTIONS),
  repeatInterval: z.coerce.number(),
  repeatEndCount: z.coerce.number(),
});

const noRepeatSchema = baseSchema.extend({ isRepeat: z.literal(false) });

const createScheduleSchema = z.union([repeatSchema, noRepeatSchema]);

// 스케줄 생성
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // request 검증
    const { success, data: requestBody } = createScheduleSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const { tagIds, ...rest } = requestBody;

    // 스케줄 생성 쿼리
    await prisma.schedule.create({
      data: { ...rest, userId: user.id, tags: { connect: tagIds.map((id) => ({ id })) } },
    });

    return NextResponse.json("ok", { status: 200 });
  });
}
