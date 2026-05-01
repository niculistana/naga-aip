// Helper to extract user from better-auth session
import dotenv from "dotenv";
import path from "path";
import ViteExpress from "vite-express";
import morgan from "morgan";
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});
import express from "express";
import NodeCache from "node-cache";
import cors from "cors"; // Import the CORS middleware
import { getAllByTable } from "./routes/data/get-all-by-table";
import { getOneByTableAndId } from "./routes/data/get-one-by-table-and-id";
import { sql } from "./db";
import { getAppBundle } from "./routes/app/get-app-bundle";
import { getStaticAssets } from "./middleware/assets";

const PROD_CLIENT_HOST = process.env.CLIENT_HOST;
const allowedHost =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : PROD_CLIENT_HOST;

const app = express();
const cache = new NodeCache({
  stdTTL: 100,
});

app.use("/assets", getStaticAssets);

app.use(morgan("tiny"));

app.get("/api/data/one/:table/id/:id", getOneByTableAndId(sql, cache));

app.get("/api/data/all/:table", getAllByTable(sql, cache));

app.use(getAppBundle);

// Configure CORS middleware
app.use(
  cors({
    origin: allowedHost,
    methods: ["GET"], // Specify allowed HTTP methods
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
