import { Request, Response } from "express";
import { CreateTechnicianRequest, ResetTechnicianPasswordRequest, UpdateTechnicianRequest } from "../dtos/users.dto";
import { prisma } from "../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../lib/paginate";
import { hashPassword } from "../services/password.service";
import { User } from "../generated/prisma/client";

const excludePassword = (user: User) => {
  const { passwordHash: _omitted, ...safeUser } = user;
  return safeUser;
};

export const getTechnicians = async (
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
  const where = { role: "Technician" as const };

  const [technicians, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json(buildPaginatedResponse(technicians.map(excludePassword), total, page, limit));
};

export const getTechnicianById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const technician = await prisma.user.findFirst({
    where: { id, role: "Technician" },
  });

  if (!technician) {
    res.status(404).json({ message: "Technician not found" });
    return;
  }

  res.json(excludePassword(technician));
};

export const createTechnician = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullName, email, password, phoneNumber } =
    req.body as CreateTechnicianRequest;

  const passwordHash = await hashPassword(password);

  const technician = await prisma.user.create({
    data: { fullName, email, passwordHash, phoneNumber, role: "Technician" },
  });

  res.status(201).json(excludePassword(technician));
};

export const updateTechnician = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const data = req.body as UpdateTechnicianRequest;

  const existing = await prisma.user.findFirst({
    where: { id, role: "Technician" },
  });

  if (!existing) {
    res.status(404).json({ message: "Technician not found" });
    return;
  }

  const updated = await prisma.user.update({ where: { id }, data });

  res.json(excludePassword(updated));
};

export const resetTechnicianPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { newPassword } = req.body as ResetTechnicianPasswordRequest;

  const existing = await prisma.user.findFirst({
    where: { id, role: "Technician" },
  });

  if (!existing) {
    res.status(404).json({ message: "Technician not found" });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  res.json({ message: "Password reset successfully" });
};
