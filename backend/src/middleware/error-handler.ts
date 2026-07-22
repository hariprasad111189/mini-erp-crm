import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError, NotFoundError } from "../errors/app-error";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "A record with the same unique field already exists",
        details: error.meta
      }
    });
  }

  console.error(error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong"
    }
  });
};

