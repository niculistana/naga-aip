// Helper to extract user from better-auth session
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import type { ServerBuild } from "react-router";
import ViteExpress from "vite-express";
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});
import express from "express";
import type { Request, Response } from "express";
import { createRequestHandler } from "@react-router/express";
import cors from "cors"; // Import the CORS middleware
import { sql } from "./db";

const app = express();

app.all("/api/auth/*", async (req, res, next) => {
  next();
});

// In-memory cache for table results
const tableCache = new Map();
app.get("/api/data/one/:table/id/:id", async (req, res, next) => {
  const table = req.params.table;
  const id = req.params.id;
  const fields = req.query.fields;

  if (!fields?.length) {
    return res
      .status(400)
      .json({ message: "Fields query params are are required" });
  }

  const allowedFields = ["id"];
  const filterParams = (str: string) => allowedFields.includes(str);
  const safeFields = fields.toString().split(",").filter(filterParams);
  const safeFieldsStr = safeFields.join(", ");

  const result = sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)} where id=${sql.unsafe(id)}`;
  return res.status(200).json({ result });
});

app.get("/api/data/all/:table", async (req, res, next) => {
  // NOTE: This endpoint is not intended for production use and should be protected or removed in a real application
  const table = req.params.table;
  const fields = req.query.fields;

  if (!fields?.length) {
    return res
      .status(400)
      .json({ message: "Fields query params are are required" });
  }

  const allowedFields = ["id"];
  const filterParams = (str: string) => allowedFields.includes(str);
  const safeFields = fields.toString().split(",").filter(filterParams);
  const safeFieldsStr = safeFields.join(", ");

  // Use a cache key that includes both table and fields for specificity
  const cacheKey = `${table}:${safeFieldsStr}`;

  if (tableCache.has(cacheKey)) {
    return res.status(200).json({ result: tableCache.get(cacheKey) });
  }

  const result = await sql`SELECT * from ${sql.unsafe(table)};`;

  return res.status(200).json({ result });
});

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

const port = 3000;
const onServerWake = () => {
  console.log("Server is listening...");
};

if (process.env.NODE_ENV === "development") {
  ViteExpress.listen(app, port, onServerWake);
} else {
  app.listen(port, onServerWake);
}
