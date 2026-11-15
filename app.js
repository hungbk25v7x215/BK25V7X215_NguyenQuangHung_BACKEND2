import express, { json } from "express";

import cors from "cors";
import swaggerUi from "swagger-ui-express";
import contactsRouter from "./app/routes/contact.routes.js";
import ApiError from "./app/api_error.js";
import openApi from "./app/openapi.js";

const app = express();

app.use(cors());

app.use(json());

app.get("/", (req, res) => {
  res.json({ message: "Chào mừng bạn đến với ứng dụng sổ liên lạc." });
});

app.use("/api/contacts", contactsRouter);
app.get("/openapi.json", (_req, res) => res.json(openApi));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApi));

app.use((_req, _res, next) => next(new ApiError(404, "Resource not found")));

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({ message: `${field || "contact"} already exists` });
  }
  const status = error.statusCode || error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 ? "Internal Server Error" : error.message,
  });
});

export default app;
