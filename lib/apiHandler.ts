import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CustomError } from "./customError";

async function apiHandler(callback: () => Promise<NextResponse>) {
  try {
    return await callback();
  } catch (error) {
    // simple logging
    if (error instanceof Error) console.error("Error occurred in API handler:", error.message ?? error);

    // CustomError handling
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // ZodError error handling
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    // basic error & prisma error handling
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export default apiHandler;
