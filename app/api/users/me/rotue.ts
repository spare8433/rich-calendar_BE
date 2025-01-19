import { NextRequest, NextResponse } from "next/server";
import authenticate from "@/lib/authenticate";
import { CustomError } from "@/lib/customError";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
