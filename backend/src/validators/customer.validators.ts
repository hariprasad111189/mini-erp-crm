import { z } from "zod";
import { paginationQuerySchema } from "./common.validators";

export const customerBodySchema = z.object({
  name: z.string().trim().min(2),
  mobile: z.string().trim().min(7).max(20),
  email: z.string().email(),
  businessName: z.string().trim().min(2),
  gstNumber: z.string().trim().optional().nullable(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().trim().min(5),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().optional().nullable()
});

export const updateCustomerBodySchema = customerBodySchema.partial();

export const customerQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).optional()
});

export const followUpNoteBodySchema = z.object({
  note: z.string().trim().min(1)
});

