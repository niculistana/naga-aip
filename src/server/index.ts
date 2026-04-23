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
import { auth } from "./auth";
import express from "express";
import type { Request, Response } from "express";
import { createRequestHandler } from "@react-router/express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import cors from "cors"; // Import the CORS middleware
import { sql } from "./db";

const app = express();

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  // 2. Check if a valid session exists
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({
    user: session.user,
    session: session.session,
  });
});

app.get("/api/data/all/:table", async (req, res, next) => {
  const table = req.params.table;
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
if (process.env.NODE_ENV === "development") {
  app.use(
    "/assets",
    express.static(path.join(import.meta.dirname, "../../build/client/assets")),
  );
}

const serverPath = path.join(
  import.meta.dirname,
  "../../build/server/index.js",
);
const ssrHandlerPromise = async () => {
  if (fs.existsSync(serverPath)) {
    const importedBuild = (await import(
      pathToFileURL(serverPath).href
    )) as Record<string, unknown>;

    const serverBuild =
      ((importedBuild.default ?? importedBuild) as ServerBuild) ||
      importedBuild;

    return createRequestHandler({
      build: serverBuild,
      mode:
        process.env.NODE_ENV === "development" ? "development" : "production",
    });
  }

  return null;
};
app.use(async (req: Request, res: Response, next) => {
  const reactRouterRequestHandler = await ssrHandlerPromise();
  if (reactRouterRequestHandler) {
    return reactRouterRequestHandler(req, res, next);
  }

  return res.status(404).send({ message: "404" });
});

const port = 3000;
const onServerWake = () => {
  console.log("Server is listening...");
};

if (process.env.NODE_ENV === "development") {
  ViteExpress.listen(app, port, onServerWake);
} else {
  app.listen(port, onServerWake);
}
