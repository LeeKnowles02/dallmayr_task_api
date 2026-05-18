import { Request, Response } from "express";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from "../dtos/tasks.dto";
import { prisma } from "../lib/prisma";
import { createTaskHistory } from "../services/taskHistory.service";
import { upload } from "../services/fileStorage.service";

const taskInclude = {
  customer: true,
  machine: true,
  technician: {
    omit: { passwordHash: true },
  },
} as const;

export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  const tasks = await prisma.taskItem.findMany({
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const task = await prisma.taskItem.findUnique({
    where: { id },
    include: taskInclude,
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json(task);
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as CreateTaskRequest;

  const task = await prisma.taskItem.create({
    data: {
      ...body,
      status: body.status ?? "Assigned",
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
    include: taskInclude,
  });

  await createTaskHistory({
    taskItemId: task.id,
    changedByUserId: req.user!.userId,
    action: "TaskCreated",
    newStatus: task.status,
  });

  res.status(201).json(task);
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const body = req.body as UpdateTaskRequest;

  const existing = await prisma.taskItem.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const task = await prisma.taskItem.update({
    where: { id },
    data: {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
    include: taskInclude,
  });

  await createTaskHistory({
    taskItemId: id,
    changedByUserId: req.user!.userId,
    action: "TaskUpdated",
    oldStatus: existing.status,
    newStatus: task.status,
  });

  res.json(task);
};

export const getTaskHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const taskId = parseInt(req.params.id as string);

  const task = await prisma.taskItem.findUnique({ where: { id: taskId } });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const history = await prisma.taskHistory.findMany({
    where: { taskItemId: taskId },
    include: {
      changedBy: { omit: { passwordHash: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(history);
};

export const getMyTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tasks = await prisma.taskItem.findMany({
    where: { technicianId: req.user!.userId },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
};

export const getMyTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const task = await prisma.taskItem.findFirst({
    where: { id, technicianId: req.user!.userId },
    include: taskInclude,
  });

  if (!task) {
    res.status(404).json({ message: "Task not found or not assigned to you" });
    return;
  }

  res.json(task);
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { status, completionNotes } = req.body as UpdateTaskStatusRequest;

  const task = await prisma.taskItem.findFirst({
    where: { id, technicianId: req.user!.userId },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found or not assigned to you" });
    return;
  }

  const updatedTask = await prisma.taskItem.update({
    where: { id },
    data: {
      status,
      completionNotes,
      completedAt: status === "Completed" ? new Date() : undefined,
    },
    include: taskInclude,
  });

  await createTaskHistory({
    taskItemId: id,
    changedByUserId: req.user!.userId,
    action: "StatusChanged",
    oldStatus: task.status,
    newStatus: status,
    notes: completionNotes,
  });

  res.json(updatedTask);
};

export const uploadTaskPhoto = [
  upload.single("photo"),
  async (req: Request, res: Response): Promise<void> => {
    const taskId = parseInt(req.params.id as string);

    const task = await prisma.taskItem.findFirst({
      where: { id: taskId, technicianId: req.user!.userId },
    });

    if (!task) {
      res
        .status(404)
        .json({ message: "Task not found or not assigned to you" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No photo uploaded" });
      return;
    }

    const photo = await prisma.taskPhoto.create({
      data: {
        taskItemId: taskId,
        uploadedByUserId: req.user!.userId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      },
    });

    await createTaskHistory({
      taskItemId: taskId,
      changedByUserId: req.user!.userId,
      action: "PhotoUploaded",
    });

    res.status(201).json(photo);
  },
];
