import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createProduct,
  getLowStockProducts,
  getProduct,
  listProducts,
  recordStockMovement,
  updateProduct
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { idParamsSchema } from "../validators/common.validators";
import {
  productBodySchema,
  productQuerySchema,
  stockMovementBodySchema,
  updateProductBodySchema
} from "../validators/product.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate({ query: productQuerySchema }), listProducts);
router.get("/low-stock", getLowStockProducts);
router.post("/", requireRoles(Role.ADMIN, Role.WAREHOUSE), validate({ body: productBodySchema }), createProduct);
router.get("/:id", validate({ params: idParamsSchema }), getProduct);
router.patch(
  "/:id",
  requireRoles(Role.ADMIN, Role.WAREHOUSE),
  validate({ params: idParamsSchema, body: updateProductBodySchema }),
  updateProduct
);
router.post(
  "/:id/stock-movements",
  requireRoles(Role.ADMIN, Role.WAREHOUSE),
  validate({ params: idParamsSchema, body: stockMovementBodySchema }),
  recordStockMovement
);

export default router;

