import type { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { UnauthorizedError } from "../errors/app-error";
import { verifyToken } from "../utils/jwt";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization");
  const [, token] = header?.match(/^Bearer\s+(.+)$/i) ?? [];

  if (!token) {
    return next(new UnauthorizedError("Missing bearer token"));
  }

  try {
    const payload = verifyToken<JwtPayload>(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

