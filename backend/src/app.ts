import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mini-erp-crm-api" });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

