import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import { COLORS, IMPORTANCE_OPTIONS, REPEAT_FREQUENCY_OPTIONS } from "@/constants";
import authenticate from "@/lib/authenticate";
import apiHandler from "@/lib/apiHandler";
import { calculateDateRangeDiff, calculateRepeatEndDate } from "@/lib/utils";
import dayjs from "dayjs";

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
  beforeStartAt: z.string().datetime(),
  beforeEndAt: z.string().datetime(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
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
    const { success, data: parsedRequestData } = updateScheduleSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      select: { id: true, startDate: true, endDate: true },
      where: { id: parsedPathParams.data.sid },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    // const { tagIds, isRepeat, repeatEndCount, repeatFrequency, repeatInterval, endDate, ...rest } = parsedRequestData;
    const { tagIds, startAt, endAt, beforeStartAt, beforeEndAt, ...updateRequest } = parsedRequestData;
    const { isRepeat, repeatEndCount, repeatFrequency, repeatInterval } = updateRequest;
    const { startDiffMs, endDiffMs } = calculateDateRangeDiff({ startAt, endAt, beforeStartAt, beforeEndAt });

    const changedStartDate = dayjs(schedule.startDate).add(startDiffMs, "ms").toISOString();
    const changedEndDate = dayjs(schedule.endDate).add(endDiffMs, "ms").toISOString();

    // 스케줄 업데이트 쿼리
    await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        ...updateRequest,
        tags: { connect: tagIds.map((id) => ({ id })) },
        startDate: changedStartDate,
        endDate: changedEndDate,
        repeatEndDate: isRepeat
          ? calculateRepeatEndDate({ repeatEndCount, repeatFrequency, repeatInterval, endDate: changedEndDate })
          : changedEndDate,
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
    const { success, data: parsedPathParams } = pathParamsSchema.safeParse(await params);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 삭제 쿼리
    const schedule = await prisma.schedule.delete({ where: { id: parsedPathParams.sid } });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    return NextResponse.json("ok", { status: 200 });
  });
}
