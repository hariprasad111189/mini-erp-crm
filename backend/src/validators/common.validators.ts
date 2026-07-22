import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().uuid()
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional()
});

