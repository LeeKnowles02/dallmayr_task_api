import { Request, Response } from "express";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  taskFilterSchema,
} from "../dtos/tasks.dto";
import { prisma } from "../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../lib/paginate";
import { createTaskHistory } from "../services/taskHistory.service";
import { upload } from "../services/fileStorage.service";

const taskInclude = {
  customer: true,
  machine: true,
  technician: {
    omit: { passwordHash: true },
  },
} as const;

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const parsed = taskFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query params", errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { status, priority, technicianId, customerId, dateFrom, dateTo, search } = parsed.data;
  const pagination = parsePagination(req.query);

  if (!pagination.success) {
    res.status(400).json({
      message: "Invalid query params",
      errors: pagination.errors,
    });
    return;
  }

  const { page, limit } = pagination.data;

  const andConditions: Record<string, unknown>[] = [
    ...(status ? [{ status }] : []),
    ...(priority ? [{ priority }] : []),
    ...(technicianId ? [{ technicianId }] : []),
    ...(customerId ? [{ customerId }] : []),
  ];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search,
          },
        },
        {
          customer: {
            is: {
              name: {
                contains: search,
              },
            },
          },
        },
        {
          technician: {
            is: {
              fullName: {
                contains: search,
              },
            },
          },
        },
      ],
    });
  }

  const dateRangeOrConditions: Record<string, unknown>[] = [];

  if (dateFrom) {
    const fromDate = new Date(`${dateFrom}T00:00:00.000Z`);

    dateRangeOrConditions.push(
      { completedAt: { gte: fromDate } },
      {
        AND: [
          { completedAt: null },
          { dueDate: { gte: fromDate } },
        ],
      }
    );
  }

  if (dateTo) {
    const toDate = new Date(`${dateTo}T23:59:59.999Z`);

    dateRangeOrConditions.push(
      { completedAt: { lte: toDate } },
      {
        AND: [
          { completedAt: null },
          { dueDate: { lte: toDate } },
        ],
      }
    );
  }

  if (dateRangeOrConditions.length > 0) {
    andConditions.push({ OR: dateRangeOrConditions });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [tasks, total] = await Promise.all([
    prisma.taskItem.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.taskItem.count({ where }),
  ]);

  res.json(buildPaginatedResponse(tasks, total, page, limit));
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

  const pagination = parsePagination(req.query);

  if (!pagination.success) {
    res.status(400).json({
      message: "Invalid query params",
      errors: pagination.errors,
    });
    return;
  }

  const { page, limit } = pagination.data;
  const where = { taskItemId: taskId };

  const [history, total] = await Promise.all([
    prisma.taskHistory.findMany({
      where,
      include: { changedBy: { omit: { passwordHash: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.taskHistory.count({ where }),
  ]);

  res.json(buildPaginatedResponse(history, total, page, limit));
};

export const getMyTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = taskFilterSchema.pick({ status: true, priority: true }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query params", errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { status, priority } = parsed.data;
  const pagination = parsePagination(req.query);

  if (!pagination.success) {
    res.status(400).json({
      message: "Invalid query params",
      errors: pagination.errors,
    });
    return;
  }

  const { page, limit } = pagination.data;

  const where = {
    technicianId: req.user!.userId,
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [tasks, total] = await Promise.all([
    prisma.taskItem.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.taskItem.count({ where }),
  ]);

  res.json(buildPaginatedResponse(tasks, total, page, limit));
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

export const getTaskPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const taskId = parseInt(req.params.id as string);

  const task = await prisma.taskItem.findUnique({ where: { id: taskId } });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const photos = await prisma.taskPhoto.findMany({
    where: { taskItemId: taskId },
    orderBy: { uploadedAt: "desc" },
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json(
    photos.map((photo) => ({
      ...photo,
      photoUrl: `${baseUrl}/uploads/${photo.filePath.split(/[\\/]/).pop()}`,
    }))
  );
};

export const getMyTaskPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const taskId = parseInt(req.params.id as string);

  const task = await prisma.taskItem.findFirst({
    where: { id: taskId, technicianId: req.user!.userId },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found or not assigned to you" });
    return;
  }

  const photos = await prisma.taskPhoto.findMany({
    where: { taskItemId: taskId },
    orderBy: { uploadedAt: "desc" },
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json(
    photos.map((photo) => ({
      ...photo,
      photoUrl: `${baseUrl}/uploads/${photo.filePath.split(/[\\/]/).pop()}`,
    }))
  );
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

    const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

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

    res.status(201).json({ ...photo, photoUrl });
  },
];
