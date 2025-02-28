import { FREQUENCY } from "@/constants";
import { RepeatFrequency } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

export function getQueryParamObject(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  return Object.fromEntries(searchParams.entries());
}

interface RepeatParam {
  endDate: string;
  repeatInterval: number;
  repeatEndCount: number;
  repeatFrequency: RepeatFrequency;
}

export const calculateRepeatEndDate = (repeatParam: RepeatParam) => {
  const { endDate, repeatInterval, repeatEndCount, repeatFrequency } = repeatParam;
  return dayjs(endDate)
    .add(repeatInterval * repeatEndCount, FREQUENCY[repeatFrequency])
    .toISOString();
};

interface DateRangeParam {
  beforeStartAt: string;
  beforeEndAt: string;
  startAt: string;
  endAt: string;
}

export const calculateDateRangeDiff = (dateRangeParam: DateRangeParam) => {
  const { startAt, endAt, beforeStartAt, beforeEndAt } = dateRangeParam;
  const startDiffMs = dayjs(startAt).diff(dayjs(beforeStartAt));
  const endDiffMs = dayjs(endAt).diff(dayjs(beforeEndAt));

  return { startDiffMs, endDiffMs };
};
