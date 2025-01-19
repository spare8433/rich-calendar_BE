import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { generateToken } from "@/lib/jwt";
import { z } from "zod";
import { CustomError } from "@/lib/customError";

const requestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function GET(request: NextRequest) {
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
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
