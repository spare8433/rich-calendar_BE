import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { generateToken } from "@/lib/jwt";
import { z } from "zod";

const requestSchema = z.object({
  username: z.string().min(5).max(20),
  password: z.string().min(9).max(32),
});

export async function POST(request: NextRequest) {
  try {
    // request 검증
    const { success, data: requestBody } = requestSchema.safeParse(await request.json());
    if (!success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { username: requestBody.username } });
    if (!user) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const isPasswordValid = await bcrypt.compare(requestBody.password, user.password);
    if (!isPasswordValid) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const token = generateToken(user.id);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
