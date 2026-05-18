import { Request, Response } from "express";
import {
  CreateMachineRequest,
  UpdateMachineRequest,
} from "../dtos/machines.dto";
import { prisma } from "../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../lib/paginate";

export const getMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  const pagination = parsePagination(req.query);

  if (!pagination.success) {
    res.status(400).json({
      message: "Invalid query params",
      errors: pagination.errors,
    });
    return;
  }

  const { page, limit } = pagination.data;

  const [machines, total] = await Promise.all([
    prisma.machine.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.machine.count(),
  ]);

  res.json(buildPaginatedResponse(machines, total, page, limit));
};

export const getMachineById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const machine = await prisma.machine.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!machine) {
    res.status(404).json({ message: "Machine not found" });
    return;
  }

  res.json(machine);
};

export const createMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as CreateMachineRequest;

  const machine = await prisma.machine.create({
    data,
    include: { customer: true },
  });

  res.status(201).json(machine);
};

export const updateMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const data = req.body as UpdateMachineRequest;

  const existing = await prisma.machine.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Machine not found" });
    return;
  }

  const machine = await prisma.machine.update({
    where: { id },
    data,
    include: { customer: true },
  });

  res.json(machine);
};

export const deleteMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.machine.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Machine not found" });
    return;
  }

  await prisma.machine.delete({ where: { id } });
  res.status(204).send();
};
