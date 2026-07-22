import { z } from "zod";
import { paginationQuerySchema } from "./common.validators";

export const productBodySchema = z.object({
  name: z.string().trim().min(2),
  sku: z.string().trim().min(2),
  category: z.string().trim().min(2),
  unitPrice: z.coerce.number().positive(),
  currentStock: z.coerce.number().int().min(0),
  minStockAlertQty: z.coerce.number().int().min(0),
  location: z.string().trim().min(2)
});

export const updateProductBodySchema = productBodySchema.partial();

export const productQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().optional()
});

export const stockMovementBodySchema = z.object({
  quantity: z.coerce.number().int().positive(),
  movementType: z.enum(["IN", "OUT"]),
  reason: z.string().trim().min(2)
});

