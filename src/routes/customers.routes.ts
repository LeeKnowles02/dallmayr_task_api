import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controllers/customers.controller";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../dtos/customers.dto";
import { authenticate } from "../middleware/authenticate";
import { authorise } from "../middleware/authorise";
import { validate } from "../middleware/validate";

export const customersRouter = Router();

customersRouter.use(authenticate, authorise("Admin"));

customersRouter.get("/", getCustomers);
customersRouter.post("/", validate(createCustomerSchema), createCustomer);
customersRouter.get("/:id", getCustomerById);
customersRouter.put("/:id", validate(updateCustomerSchema), updateCustomer);
customersRouter.delete("/:id", deleteCustomer);
