import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof Error && "code" in error) {
    const prismaError = error as { code: string };

    if (prismaError.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    if (prismaError.code === "P2002") {
      res.status(409).json({ message: "A record with this value already exists" });
      return;
    }
  }

  res.status(500).json({ message: "Internal server error" });
};
