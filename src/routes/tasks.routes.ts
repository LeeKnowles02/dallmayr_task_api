import { Router } from "express";
import {
  createTask,
  getMyTaskById,
  getMyTasks,
  getTaskById,
  getTaskHistory,
  getTasks,
  updateTask,
  updateTaskStatus,
  uploadTaskPhoto,
} from "../controllers/tasks.controller";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../dtos/tasks.dto";
import { authenticate } from "../middleware/authenticate";
import { authorise } from "../middleware/authorise";
import { validate } from "../middleware/validate";

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get("/my-tasks", authorise("Technician"), getMyTasks);
tasksRouter.get("/my-tasks/:id", authorise("Technician"), getMyTaskById);
tasksRouter.patch("/:id/status", authorise("Technician"), validate(updateTaskStatusSchema), updateTaskStatus);
tasksRouter.post("/:id/photo", authorise("Technician"), ...uploadTaskPhoto);

tasksRouter.get("/", authorise("Admin"), getTasks);
tasksRouter.post("/", authorise("Admin"), validate(createTaskSchema), createTask);
tasksRouter.get("/:id", authorise("Admin"), getTaskById);
tasksRouter.put("/:id", authorise("Admin"), validate(updateTaskSchema), updateTask);
tasksRouter.get("/:id/history", authorise("Admin"), getTaskHistory);
