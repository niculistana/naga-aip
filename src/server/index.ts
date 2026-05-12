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
import { getAllTables } from "./routes/tables/get-all-tables.js";
import { getAllByTable } from "./routes/data/get-all-by-table.js";
import { getOneByTableAndId } from "./routes/data/get-one-by-table-and-id.js";
import { dbClient } from "./db/db-client.js";
import { getAppBundle } from "./routes/app/get-app-bundle.js";
import { getStaticAssets } from "./middleware/assets/index.js";
import { getAllFields } from "./routes/fields/get-all-fields.js";
import { getAllFieldsByTable } from "./routes/fields/get-all-fields-by-table.js";
import { getOneByTableAndName } from "./routes/data/get-one-by-table-and-name.js";
import { getSectorsFromClusters } from "./routes/data/get-sectors-from-raw-clusters.js";
import { getProgramsFromRawPrograms } from "./routes/data/get-programs-from-raw-programs.js";
import { getUnitsFromRawAgencies } from "./routes/data/get-units-from-agencies.js";

const app = express();
const cache = new NodeCache({
  stdTTL: 100,
});

app.use("/assets", getStaticAssets("/assets"));
app.use("/openapi.json", getStaticAssets("/openapi.json"));
app.use("/naga-seal.png", getStaticAssets("/naga-seal.png"));

app.use(morgan("tiny"));

app.get("/api/data/one/:table/id/:id", getOneByTableAndId(dbClient, cache));

app.get(
  "/api/data/one/:table/name/:name",
  getOneByTableAndName(dbClient, cache),
);

app.get("/api/data/all/:table", getAllByTable(dbClient, cache));
app.get(
  "/api/data/one/:table/name/:name",
  getOneByTableAndName(dbClient, cache),
);

app.get("/api/sectors", getSectorsFromClusters(dbClient, cache));

app.get("/api/programs", getProgramsFromRawPrograms(dbClient, cache));

app.get("/api/units", getUnitsFromRawAgencies(dbClient, cache));

app.get("/api/tables", getAllTables);

app.get("/api/fields", getAllFields);

app.get("/api/fields/:table", getAllFieldsByTable);

// NOTE: this must be the last handler for all requests as this falls back to the client routes
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
