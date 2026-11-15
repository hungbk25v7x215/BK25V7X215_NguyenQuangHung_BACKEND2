import express, { json } from "express";

import cors from "cors";
import contactsRouter from "./app/routes/contact.routes.js";
import ApiError from "./app/api_error.js";

const app = express();

app.use(cors());

app.use(json());

app.get("/", (req, res) => {
  res.json({ message: "Chào mừng bạn đến với ứng dụng sổ liên lạc." });
});

app.use("/api/contacts", contactsRouter);

app.use((_req, _res, next) => next(new ApiError(404, "Resource not found")));

app.use((error, _req, res, _next) => {
  res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
});

export default app;
