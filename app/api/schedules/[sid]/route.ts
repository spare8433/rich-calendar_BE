import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import { COLORS, IMPORTANCE_OPTIONS, REPEAT_FREQUENCY_OPTIONS } from "@/constants";
import { CustomError } from "@/lib/customError";
import authenticate from "@/lib/authenticate";
import apiHandler from "@/lib/apiHandler";

const pathParamsSchema = z.object({ sid: z.coerce.number() });

// 스케줄 조회
export async function GET(request: NextRequest, pathParams: { sid: string }) {
  try {
    await authenticate(request); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const { success, data } = pathParamsSchema.safeParse(pathParams);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({ where: { id: data.sid }, include: { tags: true } });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

const updateScheduleSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  importance: z.enum(IMPORTANCE_OPTIONS).optional(),
  color: z.enum(COLORS).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isRepeat: z.enum(["yes", "no"]).optional(),
  repeatFrequency: z.enum(REPEAT_FREQUENCY_OPTIONS).optional(),
  repeatInterval: z.coerce.number().optional(),
  repeatEndCount: z.coerce.number().optional(),
});

// 스케줄 수정
export async function PATCH(request: NextRequest, pathParams: { sid: string }) {
  try {
    await authenticate(request); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const parsedPathParams = pathParamsSchema.safeParse(pathParams);
    if (!parsedPathParams.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // request body 검증
    const parsedRequestBody = updateScheduleSchema.safeParse(await request.json());
    if (!parsedRequestBody.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: parsedPathParams.data.sid },
      include: { tags: true },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const {
      title,
      description,
      importance,
      color,
      startDate,
      endDate,
      isRepeat,
      repeatFrequency,
      repeatInterval,
      repeatEndCount,
    } = parsedRequestBody.data;

    // 스케줄 업데이트 쿼리
    await prisma.schedule.update({
      where: { id: parsedPathParams.data.sid },
      data: {
        ...(title && { title: title }),
        ...(description && { description: description }),
        ...(importance && { importance: importance }),
        ...(color && { color: color }),
        ...(startDate && { startDate: startDate }),
        ...(endDate && { endDate: endDate }),
        ...(isRepeat && isRepeat === "yes"
          ? { isRepeat: true, repeatFrequency, repeatInterval, repeatEndCount }
          : { isRepeat: false, repeatFrequency: null, repeatInterval: null, repeatEndCount: null }),
      },
    });

    return NextResponse.json("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 스케줄 삭제
export function DELETE(request: NextRequest, pathParams: { sid: string }) {
  return apiHandler(async () => {
    await authenticate(request); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const { success, data: parsedPathParams } = pathParamsSchema.safeParse(pathParams);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 삭제 쿼리
    await prisma.schedule.delete({ where: { id: parsedPathParams.sid } });

    return NextResponse.json("ok", { status: 200 });
  });
}
