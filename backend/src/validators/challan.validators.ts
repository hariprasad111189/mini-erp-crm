import { z } from "zod";
import { paginationQuerySchema } from "./common.validators";

export const challanItemBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive()
});

export const createChallanBodySchema = z.object({
  customerId: z.string().uuid(),
  status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
  items: z.array(challanItemBodySchema).min(1)
});

export const challanQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).optional(),
  customerId: z.string().uuid().optional()
});

