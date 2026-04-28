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

const app = express();
const cache = new NodeCache({
  stdTTL: 100,
});

app.use(morgan("tiny"));

app.all("/api/auth/*", async (req, res, next) => {
  next();
});

app.get("/api/data/one/:table/id/:id", getOneByTableAndId(sql, cache));

app.get("/api/data/all/:table", getAllByTable(sql, cache));

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
