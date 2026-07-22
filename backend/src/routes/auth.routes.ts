import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validators";

const router = Router();

router.post("/login", validate({ body: loginSchema }), login);

export default router;

