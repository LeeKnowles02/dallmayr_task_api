import { Request, Response } from "express";
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../dtos/customers.dto";
import { prisma } from "../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../lib/paginate";

export const getCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page, limit } = parsePagination(req.query);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count(),
  ]);

  res.json(buildPaginatedResponse(customers, total, page, limit));
};

export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  res.json(customer);
};

export const createCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as CreateCustomerRequest;
  const customer = await prisma.customer.create({ data });
  res.status(201).json(customer);
};

export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const data = req.body as UpdateCustomerRequest;

  const existing = await prisma.customer.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  const customer = await prisma.customer.update({ where: { id }, data });
  res.json(customer);
};

export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.customer.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  await prisma.customer.delete({ where: { id } });
  res.status(204).send();
};
