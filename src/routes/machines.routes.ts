import { Router } from "express";
import {
  createMachine,
  deleteMachine,
  getMachineById,
  getMachines,
  updateMachine,
} from "../controllers/machines.controller";
import {
  createMachineSchema,
  updateMachineSchema,
} from "../dtos/machines.dto";
import { authenticate } from "../middleware/authenticate";
import { authorise } from "../middleware/authorise";
import { validate } from "../middleware/validate";

export const machinesRouter = Router();

machinesRouter.use(authenticate, authorise("Admin"));

machinesRouter.get("/", getMachines);
machinesRouter.post("/", validate(createMachineSchema), createMachine);
machinesRouter.get("/:id", getMachineById);
machinesRouter.put("/:id", validate(updateMachineSchema), updateMachine);
machinesRouter.delete("/:id", deleteMachine);
