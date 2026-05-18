import rateLimit from "express-rate-limit";
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

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/login", loginRateLimiter, validate(loginSchema), login);
authRouter.get("/me", authenticate, me);
authRouter.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);
