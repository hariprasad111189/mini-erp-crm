import { Role } from "@prisma/client";
import { Router } from "express";
import {
  cancelChallan,
  confirmChallan,
  createChallan,
  downloadChallanPdf,
  getChallan,
  listChallans
} from "../controllers/challan.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { idParamsSchema } from "../validators/common.validators";
import { challanQuerySchema, createChallanBodySchema } from "../validators/challan.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate({ query: challanQuerySchema }), listChallans);
router.post("/", requireRoles(Role.ADMIN, Role.SALES), validate({ body: createChallanBodySchema }), createChallan);
router.get("/:id", validate({ params: idParamsSchema }), getChallan);
router.get("/:id/pdf", validate({ params: idParamsSchema }), downloadChallanPdf);
router.post("/:id/confirm", requireRoles(Role.ADMIN, Role.SALES), validate({ params: idParamsSchema }), confirmChallan);
router.post("/:id/cancel", requireRoles(Role.ADMIN, Role.SALES), validate({ params: idParamsSchema }), cancelChallan);

export default router;

