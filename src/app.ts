import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { customersRouter } from "./routes/customers.routes";
import { machinesRouter } from "./routes/machines.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { usersRouter } from "./routes/users.routes";

const app = express();
const PORT = process.env.PORT ?? 5000;
const UPLOAD_PATH = process.env.UPLOAD_PATH ?? "src/uploads";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(UPLOAD_PATH)));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/tasks", tasksRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
