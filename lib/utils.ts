import { NextRequest } from "next/server";

export function getQueryParamObject(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  return Object.fromEntries(searchParams.entries());
}
