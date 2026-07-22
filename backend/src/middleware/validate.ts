import type { RequestHandler } from "express";
import type { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../errors/app-error";

type RequestSchemas = {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
};

const toDetails = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      next();
    } catch (error) {
      next(new ValidationError("Request validation failed", toDetails(error as ZodError)));
    }
  };

