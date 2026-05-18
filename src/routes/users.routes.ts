import { Router } from "express";
import {
  createTechnician,
  getTechnicianById,
  getTechnicians,
  updateTechnician,
} from "../controllers/users.controller";
import {
  createTechnicianSchema,
  updateTechnicianSchema,
} from "../dtos/users.dto";
import { authenticate } from "../middleware/authenticate";
import { authorise } from "../middleware/authorise";
import { validate } from "../middleware/validate";

export const usersRouter = Router();

usersRouter.use(authenticate, authorise("Admin"));

usersRouter.get("/technicians", getTechnicians);
usersRouter.post("/technicians", validate(createTechnicianSchema), createTechnician);
usersRouter.get("/technicians/:id", getTechnicianById);
usersRouter.put("/technicians/:id", validate(updateTechnicianSchema), updateTechnician);
