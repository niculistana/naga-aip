// Helper to extract user from better-auth session
import dotenv from "dotenv";
import path from "path";
import ViteExpress from "vite-express";
import morgan from "morgan";
import { SERVER_BASE_PATH_FROM_ROOT } from "./util.js";
dotenv.config({
  path: path.resolve(import.meta.dirname, `${SERVER_BASE_PATH_FROM_ROOT}/.env`),
});
import express from "express";
import NodeCache from "node-cache";
import { getAllByTable } from "./routes/data/get-all-by-table.js";
import { getOneByTableAndId } from "./routes/data/get-one-by-table-and-id.js";
import { sql } from "./db/index.js";
import { getAppBundle } from "./routes/app/get-app-bundle.js";
import { getStaticAssets } from "./middleware/assets/index.js";

const app = express();
const cache = new NodeCache({
  stdTTL: 100,
});

app.use("/assets", getStaticAssets);

app.use(morgan("tiny"));

app.get("/api/data/one/:table/id/:id", getOneByTableAndId(sql, cache));

app.get("/api/data/all/:table", getAllByTable(sql, cache));

app.use(getAppBundle);

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
