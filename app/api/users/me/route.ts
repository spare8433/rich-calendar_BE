import { NextResponse } from "next/server";
import authenticate from "@/lib/authenticate";
import { prisma } from "@/lib/prisma-client";
import apiHandler from "@/lib/apiHandler";

export function GET() {
  return apiHandler(async () => {
    const { username, email } = await authenticate(); // jwt token 으로 사용자 인증
    return NextResponse.json({ username, email }, { status: 200 });
  });
}

export function DELETE() {
  return apiHandler(async () => {
    const user = await authenticate(); // jwt token 으로 사용자 인증

    // 사용자 삭제
    const deletedUser = await prisma.user.delete({ where: { id: user.id } });
    if (!deletedUser) NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user, { status: 200 });
  });
}
