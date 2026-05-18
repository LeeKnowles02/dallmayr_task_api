import { Request, Response } from "express";
import { CreateTechnicianRequest, ResetTechnicianPasswordRequest, UpdateTechnicianRequest } from "../dtos/users.dto";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../services/password.service";
import { User } from "../generated/prisma/client";

const excludePassword = (user: User) => {
  const { passwordHash: _omitted, ...safeUser } = user;
  return safeUser;
};

export const getTechnicians = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const technicians = await prisma.user.findMany({
    where: { role: "Technician" },
    orderBy: { createdAt: "desc" },
  });

  res.json(technicians.map(excludePassword));
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
