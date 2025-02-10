import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import authenticate from "@/lib/authenticate";
import { getQueryParamObject } from "@/lib/utils";
import apiHandler from "@/lib/apiHandler";
import { $Enums } from "@prisma/client";
import dayjs from "dayjs";
import { FREQUENCY } from "@/constant";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const getSchedulesSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// 일자별 스케줄 목록 조회
export function GET(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    const queryParamsObject = getQueryParamObject(request); // query parameter 가져오기

    // query parameter 검증
    const { success, data: query } = getSchedulesSchema.safeParse(queryParamsObject);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    console.log(user.id);
    // 스케줄 목록 조회
    const schedules = await prisma.schedule.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        color: true,
        isRepeat: true,
        repeatFrequency: true,
        repeatInterval: true,
        repeatEndCount: true,
        tags: {
          select: { title: true },
        },
      },
      where: {
        userId: user.id,
        AND: [
          { startDate: { lte: query.endDate } },
          {
            OR: [{ endDate: { gte: query.startDate } }, { repeatEndDate: { gte: query.startDate } }],
          },
        ],
      },
      orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
    });

    interface SCHEDULE {
      id: number;
      title: string;
      color: $Enums.Color;
      startAt: string;
      endAt: string;
      tagTitles: string[];
    }

    const finalSchedules = schedules.flatMap((sch) => {
      const { id, title, color, startDate, endDate, isRepeat, repeatFrequency, repeatInterval, repeatEndCount, tags } =
        sch;
      const startDateDayjs = dayjs(startDate);
      const endDateDayjs = dayjs(endDate);
      const tagTitles = tags.map((tag) => tag.title);

      if (isRepeat && repeatInterval && repeatEndCount && repeatFrequency && repeatEndCount > 0) {
        const repeatSchedules: SCHEDULE[] = [];

        let startAt = startDateDayjs.toISOString();
        let endAt = endDateDayjs.toISOString();

        // 종료 횟수(repeatEndCount)만큼 일정 반복 조건에 맞는 일정 배열에 저장
        for (let repeatCount = 0; repeatCount <= repeatEndCount + 1; repeatCount++) {
          // 일정 반복 기준에 맞는 일정 시작, 종료 날짜 계산
          startAt = startDateDayjs.add(repeatInterval * repeatCount, FREQUENCY[repeatFrequency]).toISOString();
          endAt = endDateDayjs.add(repeatInterval * repeatCount, FREQUENCY[repeatFrequency]).toISOString();

          if (dayjs(query.endDate).isBefore(startAt) || dayjs(query.startDate).isAfter(endAt)) continue;

          repeatSchedules.push({ id, title, color, startAt, endAt, tagTitles });
        }
        return repeatSchedules;
      }
      // 일반 일정 처리
      else {
        const startAt = startDateDayjs.toISOString();
        const endAt = endDateDayjs.toISOString();
        const schedule: SCHEDULE = { id, title, color, startAt, endAt, tagTitles };
        return schedule;
      }
    });

    return NextResponse.json({ schedules: finalSchedules }, { status: 200 });
  });
}
