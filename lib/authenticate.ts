import { verifyToken } from "./jwt";
import { prisma } from "./prisma-client";
import { CustomError } from "./customError";
import { type PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cookies } from "next/headers";

const authenticate = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      console.log("Token not provided");
      throw new CustomError("Unauthorized", 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token.value);
    } catch {
      console.error("Token verification failed");
      throw new CustomError("Unauthorized", 401);
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } catch (err) {
      console.error((err as PrismaClientKnownRequestError).message);
      throw new CustomError("Server Error", 500);
    }

    if (!user) {
      console.error("User not found");
      throw new CustomError("Unauthorized", 401);
    }

    return user;
  } catch (error) {
    if (error instanceof CustomError && error.statusCode === 401) {
      throw new CustomError("Unauthorized", 401);
    }
    throw error;
  }
};

export default authenticate;
