import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "./customError";

interface MyJwtPayload extends JwtPayload {
  id: number;
}

export const generateToken = (id: number) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET!, // 비밀 키
    { expiresIn: process.env.JWT_EXPIRES_IN } // 만료 시간
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;
  } catch {
    throw new CustomError("Unauthorized", 401);
  }
};
