import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import authenticate from "@/lib/authenticate";
import { getQueryParamObject } from "@/lib/utils";
import apiHandler from "@/lib/apiHandler";
import dayjs from "dayjs";
import { $Enums } from "@prisma/client";

const queryParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  tagIds: z.array(z.coerce.number()).optional(),
});

const FREQUENCY = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
} as const;

interface REPEAT_SCHEDULE {
  id: number;
  title: string;
  color: $Enums.Color;
  isRepeat: boolean;
  startAt: string;
  endAt: string;
}

// 캘린더 뷰 일정 목록 조회
export function GET(request: NextRequest) {
  return apiHandler(async () => {
    await authenticate(); // jwt token 으로 사용자 인증

    const queryParamsObject = getQueryParamObject(request); // query parameter 가져오기

    // query parameter 검증
    const { success, data: query } = queryParamsSchema.safeParse(queryParamsObject);
    if (!success) return NextResponse.json({ error: "Bad request 1" }, { status: 400 });

    // 스케줄 목록 조회
    const schedules = await prisma.schedule.findMany({
      select: {
        id: true,
        title: true,
        color: true,
        startDate: true,
        endDate: true,
        isRepeat: true,
        repeatFrequency: true,
        repeatInterval: true,
        repeatEndCount: true,
        tags: {
          select: { title: true },
        },
      },
      where: {
        startDate: { gte: query.startDate },
        endDate: { lte: query.endDate },
        tags: { some: { id: { in: query.tagIds } } },
      },
    });

    // 최종 스케줄 배열 생성 (일정 반복 여부에 따른스케줄 및 스케줄 배열 생성 후 1차원 배열로 변환 후 저장)
    const finalSchedules: REPEAT_SCHEDULE[] = schedules.flatMap((sch) => {
      const { id, title, color, startDate, endDate, isRepeat, repeatFrequency, repeatInterval, repeatEndCount } = sch;
      const startDateDayjs = dayjs(startDate);
      const endDateDayjs = dayjs(endDate);

      // 반복 일정 처리
      if (isRepeat && repeatInterval && repeatEndCount && repeatFrequency && repeatEndCount > 0) {
        const repeatSchedules: REPEAT_SCHEDULE[] = [];

        // 종료 횟수(repeatEndCount)만큼 일정 반복 조건에 맞는 일정 배열에 저장
        for (let repeatCount = 1; repeatCount <= repeatEndCount + 1; repeatCount++) {
          // 일정 반복 기준에 맞는 일정 시작, 종료 날짜 계산
          const startAt = startDateDayjs.add(repeatInterval * repeatCount, FREQUENCY[repeatFrequency]).toISOString();
          const endAt = endDateDayjs.add(repeatInterval * repeatCount, FREQUENCY[repeatFrequency]).toISOString();
          repeatSchedules.push({ id, title, color, isRepeat, startAt, endAt });
        }
        return repeatSchedules;
      }
      // 일반 일정 처리
      else {
        const startAt = startDateDayjs.toISOString();
        const endAt = endDateDayjs.toISOString();
        return { id, title, color, isRepeat, startAt, endAt };
      }
    });

    return NextResponse.json({ schedules: finalSchedules }, { status: 200 });
  });
}
