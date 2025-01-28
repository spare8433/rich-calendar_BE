import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";
import authenticate from "@/lib/authenticate";
import { getQueryParamObject } from "@/lib/utils";
import apiHandler from "@/lib/apiHandler";

const getSchedulesSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// 일자별 스케줄 목록 조회
export function GET(request: NextRequest) {
  return apiHandler(async () => {
    await authenticate(request); // jwt token 으로 사용자 인증

    const queryParamsObject = getQueryParamObject(request); // query parameter 가져오기

    // query parameter 검증
    const { success, data: query } = getSchedulesSchema.safeParse(queryParamsObject);
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    // 스케줄 목록 조회
    const schedules = await prisma.schedule.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        color: true,
        tags: {
          select: { title: true },
        },
      },
      where: {
        startDate: { gte: query.startDate },
        endDate: { lte: query.endDate },
      },
      orderBy: { startDate: "asc", endDate: "asc" },
    });

    return NextResponse.json({ schedules }, { status: 200 });
  });
}
