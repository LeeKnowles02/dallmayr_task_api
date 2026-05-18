import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { loginSchema } from "../dtos/auth.dto";
import { validate } from "../middleware/validate";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), login);
