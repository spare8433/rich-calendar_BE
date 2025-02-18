import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import authenticate from "@/lib/authenticate";
import apiHandler from "@/lib/apiHandler";
import dayjs from "dayjs";
import { calculateDateRangeDiff } from "@/lib/utils";

const pathParamsSchema = z.object({ sid: z.coerce.number() });

// ※ 반복 일정의 경우 반복된 일정의 현재 시작날짜와 끝 날짜를 기준으로 전체일정의 변경사항을 적용
// ex) 1월1일 당일 일정을 1월 31일까지 1주마다 반복되는 일정의 경우 2주차 일정의 시작날짜는 1월8일
// 만약 1월8일 반복일정을 1월 9일로 옮기면 실제 일정이 전체 수정되어 1월 2일 부터 일정이 시작 즉 (반복일정 전체에 영향)
const updateScheduleSchema = z.object({
  beforeStartAt: z.string().datetime(),
  beforeEndAt: z.string().datetime(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isRepeat: z.coerce.boolean(),
});

// 캘린더 뷰 일정 변경
export function PATCH(request: NextRequest, { params }: { params: Promise<{ sid: number }> }) {
  return apiHandler(async () => {
    await authenticate(); // jwt token 으로 사용자 인증

    // path parameter 유효성 검증
    const parsedPathParams = pathParamsSchema.safeParse(await params);
    if (!parsedPathParams.success) return NextResponse.json({ error: "Bad request 1" }, { status: 400 });

    // request body 검증
    const parsedRequestBody = updateScheduleSchema.safeParse(await request.json());
    if (!parsedRequestBody.success) return NextResponse.json({ error: "Bad request 2" }, { status: 400 });

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      select: { id: true, startDate: true, endDate: true, repeatEndDate: true },
      where: { id: parsedPathParams.data.sid },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    // 변경된 일정이 반복일정의 경우 변경 이전과 이후 날짜(startAt, beforeStartAt)를 비교
    // 이후 실제 일정 날짜(db 의 startDate, endDate)를 변경
    // ※ 일정의 startDate, endDate 기준으로 반복 일정을 구성하므로 startDate, endDate 값 변경시 이후 반복일정에 동일한 날짜 변경사항 적용

    const { startAt, endAt, beforeStartAt, beforeEndAt, isRepeat } = parsedRequestBody.data;
    const { startDiffMs, endDiffMs } = calculateDateRangeDiff({ startAt, endAt, beforeStartAt, beforeEndAt });

    await prisma.schedule.update({
      where: { id: schedule.id },
      data: isRepeat
        ? {
            // 변경된 일정이 반복일정의 경우 변경 이전과 이후 날짜(startAt, beforeStartAt)를 비교 후 실제 일정 날짜(db 의 startDate, endDate)를 변경
            // ※ 일정의 startDate, endDate 기준으로 반복 일정을 구성하므로 startDate, endDate 값 변경시 최종적으로 반복일정 전체에 동일한 날짜 변경사항이 적용
            startDate: dayjs(schedule.startDate).add(startDiffMs, "ms").toISOString(),
            endDate: dayjs(schedule.endDate).add(endDiffMs, "ms").toISOString(),
            repeatEndDate: dayjs(schedule.repeatEndDate).add(endDiffMs, "ms").toISOString(),
          }
        : {
            // 반복일정이 아닌 일반 일정은 변경된 내용을 startDate, endDate 에 그대로 적용
            startDate: startAt,
            endDate: endAt,
            repeatEndDate: endAt,
          },
    });

    return NextResponse.json("ok", { status: 200 });
  });
}
