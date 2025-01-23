import { NextRequest, NextResponse } from "next/server";
import authenticate from "@/lib/authenticate";
import { prisma } from "@/lib/prisma-client";
import apiHandler from "@/lib/apiHandler";

export function GET(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(request); // jwt token 으로 사용자 인증
    return NextResponse.json(user, { status: 200 });
  });
}

export function DELETE(request: NextRequest) {
  return apiHandler(async () => {
    const user = await authenticate(request); // jwt token 으로 사용자 인증

    // 사용자 삭제
    const deletedUser = await prisma.user.delete({ where: { id: user.id } });
    if (!deletedUser) NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user, { status: 200 });
  });
}
