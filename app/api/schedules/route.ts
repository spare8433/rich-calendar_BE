import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import { COLORS, IMPORTANCE_OPTIONS, REPEAT_FREQUENCY_OPTIONS } from "@/constants";
import authenticate from "@/lib/authenticate";
import { getQueryParamObject } from "@/lib/utils";
import apiHandler from "@/lib/apiHandler";

const requestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  tagIds: z.array(z.coerce.number()),
});

// 스케줄 목록 조회
export function GET(request: NextRequest) {
  return apiHandler(async () => {
    await authenticate(request); // jwt token 으로 사용자 인증

    // query parameter 가져오기
    const queryParamsObject = getQueryParamObject(request);

    // query parameter 검증
    const { success, data: query } = requestSchema.safeParse(queryParamsObject);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 목록 조회
    const schedules = await prisma.schedule.findMany({
      where: {
        startDate: { gte: query.startDate },
        endDate: { lte: query.endDate },
        tags: { some: { id: { in: query.tagIds } } },
      },
      include: { tags: true },
    });

    return NextResponse.json({ schedules }, { status: 200 });
  });
}

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  importance: z.enum(IMPORTANCE_OPTIONS),
  color: z.enum(COLORS),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isRepeat: z.enum(["yes", "no"]),
});

const repeatYesSchema = baseSchema.extend({
  isRepeat: z.literal("yes"),
  repeatFrequency: z.enum(REPEAT_FREQUENCY_OPTIONS),
  repeatInterval: z.coerce.number(),
  repeatEndCount: z.coerce.number(),
});

const repeatNoSchema = baseSchema.extend({ isRepeat: z.literal("no") });

const createScheduleSchema = z.union([repeatYesSchema, repeatNoSchema]);

// 스케줄 생성
export function POST(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(request); // jwt token 으로 사용자 인증

    // request 검증
    const { success, data: requestBody } = createScheduleSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 생성 쿼리
    await prisma.schedule.create({
      data: { ...requestBody, isRepeat: requestBody.isRepeat === "yes", userId: user.id },
    });

    return NextResponse.json("ok", { status: 200 });
  });
}
