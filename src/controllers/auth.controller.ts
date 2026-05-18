import { Request, Response } from "express";
import { LoginRequest } from "../dtos/auth.dto";
import { prisma } from "../lib/prisma";
import { verifyPassword } from "../services/password.service";
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
