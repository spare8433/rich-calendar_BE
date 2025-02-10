import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import { COLORS, IMPORTANCE_OPTIONS, REPEAT_FREQUENCY_OPTIONS } from "@/constants";
import authenticate from "@/lib/authenticate";
import apiHandler from "@/lib/apiHandler";

const pathParamsSchema = z.object({ sid: z.coerce.number() });

// 스케줄 조회
export function GET(request: NextRequest, { params }: { params: Promise<{ sid: number }> }) {
  return apiHandler(async () => {
    await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const { success, data } = pathParamsSchema.safeParse(await params);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      select: {
        id: true,
        title: true,
        description: true,
        importance: true,
        color: true,
        startDate: true,
        endDate: true,
        isRepeat: true,
        repeatFrequency: true,
        repeatInterval: true,
        repeatEndCount: true,
        tags: {
          select: { id: true, title: true },
        },
      },
      where: { id: data.sid },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    return NextResponse.json(schedule, { status: 200 });
  });
}

const baseUpdateSchema = z.object({
  tagIds: z.array(z.coerce.number()),
  title: z.string(),
  description: z.string(),
  importance: z.enum(IMPORTANCE_OPTIONS),
  color: z.enum(COLORS),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const updateRepeatSchema = baseUpdateSchema.extend({
  isRepeat: z.literal(true),
  repeatFrequency: z.enum(REPEAT_FREQUENCY_OPTIONS),
  repeatInterval: z.coerce.number(),
  repeatEndCount: z.coerce.number(),
});

const updateNoRepeatSchema = baseUpdateSchema.extend({
  isRepeat: z.literal(false),
  repeatFrequency: z.null(),
  repeatInterval: z.null(),
  repeatEndCount: z.null(),
});

const updateScheduleSchema = z.union([updateRepeatSchema, updateNoRepeatSchema]);

// 스케줄 수정
export function PUT(request: NextRequest, { params }: { params: Promise<{ sid: number }> }) {
  return apiHandler(async () => {
    await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const parsedPathParams = pathParamsSchema.safeParse(await params);
    if (!parsedPathParams.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // request body 검증
    const parsedRequestBody = updateScheduleSchema.safeParse(await request.json());
    if (!parsedRequestBody.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      select: { id: true },
      where: { id: parsedPathParams.data.sid },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const { isRepeat, repeatFrequency, repeatInterval, repeatEndCount, tagIds, ...rest } = parsedRequestBody.data;

    // 스케줄 업데이트 쿼리
    await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        ...rest,
        ...(isRepeat
          ? { isRepeat, repeatFrequency, repeatInterval, repeatEndCount }
          : { isRepeat, repeatFrequency: null, repeatInterval: null, repeatEndCount: null }),
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });

    return NextResponse.json("ok", { status: 200 });
  });
}

// 스케줄 삭제
export function DELETE(request: NextRequest, { params }: { params: Promise<{ sid: number }> }) {
  return apiHandler(async () => {
    await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const { success, data: parsedPathParams } = pathParamsSchema.safeParse(params);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 삭제 쿼리
    const schedule = await prisma.schedule.delete({ where: { id: parsedPathParams.sid } });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    return NextResponse.json("ok", { status: 200 });
  });
}
