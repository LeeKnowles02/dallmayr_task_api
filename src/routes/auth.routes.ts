import { Router } from "express";
import {
  changePassword,
  login,
  me,
} from "../controllers/auth.controller";
import { changePasswordSchema, loginSchema } from "../dtos/auth.dto";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), login);
authRouter.get("/me", authenticate, me);
authRouter.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);
