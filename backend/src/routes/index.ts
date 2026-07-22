import { Router } from "express";
import authRoutes from "./auth.routes";
import challanRoutes from "./challan.routes";
import customerRoutes from "./customer.routes";
import productRoutes from "./product.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/challans", challanRoutes);

export default router;

