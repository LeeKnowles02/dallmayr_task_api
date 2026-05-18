import { Request, Response } from "express";
import { ChangePasswordRequest, LoginRequest } from "../dtos/auth.dto";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../services/password.service";
import { generateToken } from "../services/token.service";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequest;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken({ userId: user.id, role: user.role });

  res.json({
    token,
    role: user.role,
    fullName: user.fullName,
    userId: user.id,
  });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const passwordValid = await verifyPassword(currentPassword, user.passwordHash);

  if (!passwordValid) {
    res.status(400).json({ message: "Current password is incorrect" });
    return;
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  res.json({ message: "Password updated successfully" });
};
