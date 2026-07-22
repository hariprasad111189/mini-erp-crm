import { Role } from "@prisma/client";
import { Router } from "express";
import {
  addFollowUpNote,
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer
} from "../controllers/customer.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { idParamsSchema } from "../validators/common.validators";
import {
  customerBodySchema,
  customerQuerySchema,
  followUpNoteBodySchema,
  updateCustomerBodySchema
} from "../validators/customer.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate({ query: customerQuerySchema }), listCustomers);
router.post("/", requireRoles(Role.ADMIN, Role.SALES), validate({ body: customerBodySchema }), createCustomer);
router.get("/:id", validate({ params: idParamsSchema }), getCustomer);
router.patch(
  "/:id",
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamsSchema, body: updateCustomerBodySchema }),
  updateCustomer
);
router.post(
  "/:id/follow-ups",
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamsSchema, body: followUpNoteBodySchema }),
  addFollowUpNote
);

export default router;

