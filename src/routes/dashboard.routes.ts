import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { authorise } from "../middleware/authorise";

export const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, authorise("Admin"), getDashboard);
