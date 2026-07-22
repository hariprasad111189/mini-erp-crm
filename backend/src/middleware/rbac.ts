import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export const requireRoles =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    return next();
  };

