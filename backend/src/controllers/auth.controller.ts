import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
});

